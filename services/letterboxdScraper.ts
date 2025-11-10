import type { UserAMovie, ProgressUpdate } from '../types';

declare const puter: any;

const BASE_URL = 'https://letterboxd.com';
const CONCURRENCY_LIMIT = 8;

const fetchPage = async (url: string): Promise<Document> => {
  if (typeof puter === 'undefined' || typeof puter.net?.fetch !== 'function') {
    throw new Error('Puter.js library is not available. CORS-free fetch cannot be performed.');
  }
  const response = await puter.net.fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      const urlParts = url.split('/');
      const usernameIndex = urlParts.indexOf('letterboxd.com') + 1;
      const username = urlParts[usernameIndex];
      throw new Error(`Could not find Letterboxd user '${username}'. Please check the username and try again.`);
    }
    throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
  }
  const htmlText = await response.text();
  return new DOMParser().parseFromString(htmlText, 'text/html');
};

const getLastPage = (doc: Document): number => {
  const pagination = doc.querySelector('.paginate-pages');
  if (!pagination) return 1;

  const pageLinks = Array.from(pagination.querySelectorAll('.paginate-page a'));
  if (pageLinks.length === 0) {
      const currentPageSpan = pagination.querySelector('.paginate-current');
      if (currentPageSpan) {
          const pageNum = parseInt(currentPageSpan.textContent?.trim() || '1', 10);
          return isNaN(pageNum) ? 1 : pageNum;
      }
      return 1;
  }

  const lastPageElement = pageLinks[pageLinks.length - 1];
  const pageNum = parseInt(lastPageElement.textContent?.trim() || '1', 10);
  return isNaN(pageNum) ? 1 : pageNum;
};

const parseUserARatings = (doc: Document): UserAMovie[] => {
  const movies: UserAMovie[] = [];
  doc.querySelectorAll('li.griditem').forEach(item => {
    const reactComponent = item.querySelector('div.react-component');
    if (!reactComponent) return;

    const itemLink = reactComponent.getAttribute('data-item-link');
    const title = reactComponent.getAttribute('data-item-name') || 'Unknown Title';

    if (!itemLink) return;

    const url = BASE_URL + itemLink;

    const ratingSpan = item.querySelector('p.poster-viewingdata .rating');
    let rating = 0;
    if (ratingSpan) {
      const ratingClass = Array.from(ratingSpan.classList).find(c => c.startsWith('rated-'));
      if (ratingClass) {
        rating = parseInt(ratingClass.replace('rated-', ''), 10) / 2;
      }
    }

    if (rating > 0) {
      movies.push({ url, title, rating });
    }
  });
  return movies;
};

const parseUserBFilms = (doc: Document): string[] => {
  const urls: string[] = [];
  doc.querySelectorAll('li.griditem').forEach(item => {
    const reactComponent = item.querySelector('div.react-component');
    const url = reactComponent?.getAttribute('data-item-link');
    if (url) {
      urls.push(BASE_URL + url);
    }
  });
  return urls;
};

const scrapeUserPages = async <T,>(
  username: string,
  filmsPath: string, // e.g., 'films' or 'films/by/entry-rating'
  parseFunction: (doc: Document) => T[],
  onProgress: (update: ProgressUpdate) => void,
  progressMessage: string,
  genre: string, // New genre parameter
  options: {
    firstPageDoc?: Document,
    progressOverride?: { totalPages: number, pageOffset: number }
  } = {}
): Promise<T[]> => {
  const genrePath = genre === 'any' ? '' : `/genre/${genre}`;
  
  let firstPageDoc: Document;
  if (options.firstPageDoc) {
    firstPageDoc = options.firstPageDoc;
  } else {
    const firstPageUrl = `${BASE_URL}/${username}/${filmsPath}${genrePath}/page/1/`;
    onProgress({ user: username, message: `Analyzing ${username}'s library...`, currentPage: 0, totalPages: 0 });
    try {
      firstPageDoc = await fetchPage(firstPageUrl);
    } catch (e) {
      try {
        const baseUrl = `${BASE_URL}/${username}/${filmsPath}${genrePath}/`;
        firstPageDoc = await fetchPage(baseUrl);
      } catch {
        throw e;
      }
    }
  }

  const localTotalPages = getLastPage(firstPageDoc);
  const allResults: T[] = parseFunction(firstPageDoc);

  const totalPagesForProgress = options.progressOverride?.totalPages ?? localTotalPages;
  const pageOffset = options.progressOverride?.pageOffset ?? 0;
  let completedPages = 1;

  onProgress({ user: username, message: progressMessage, currentPage: pageOffset + completedPages, totalPages: totalPagesForProgress });

  if (localTotalPages <= 1) {
    return allResults;
  }
  
  const pageUrlsToFetch = Array.from({ length: localTotalPages - 1 }, (_, i) => `${BASE_URL}/${username}/${filmsPath}${genrePath}/page/${i + 2}/`);
  
  for (let i = 0; i < pageUrlsToFetch.length; i += CONCURRENCY_LIMIT) {
    const batchUrls = pageUrlsToFetch.slice(i, i + CONCURRENCY_LIMIT);
    
    const batchPromises = batchUrls.map(url => 
        fetchPage(url)
            .then(doc => parseFunction(doc))
            .catch(err => {
                console.warn(`Skipping a page for ${username} due to error:`, err.message);
                return [] as T[];
            })
    );
    
    const resolvedBatches = await Promise.all(batchPromises);
    
    for (const pageResult of resolvedBatches) {
      allResults.push(...(pageResult as T[]));
    }
    
    completedPages += batchUrls.length;
    onProgress({ user: username, message: progressMessage, currentPage: pageOffset + Math.min(completedPages, localTotalPages), totalPages: totalPagesForProgress });
  }
  
  return allResults;
};

export const runComparison = async (
  userA: string,
  userB: string,
  genre: string, // New genre parameter
  onProgress: (update: ProgressUpdate) => void
): Promise<UserAMovie[]> => {
  const genrePath = genre === 'any' ? '' : `/genre/${genre}`;

  // Step 1: Scrape User A's rated films, showing its own progress bar.
  // The firstPageDoc is not needed here as it's the first call.
  const userAMovies = await scrapeUserPages(userA, 'films/by/entry-rating', parseUserARatings, onProgress, `Scraping ${userA}...`, genre);

  // Step 2: Prepare for User B. Get total page counts for a combined progress bar.
  onProgress({ user: userB, message: `Analyzing ${userB}'s library...`, currentPage: 0, totalPages: 0 });
  
  const userBWatchedFirstPageUrl = `${BASE_URL}/${userB}/films${genrePath}/page/1/`;
  const userBRatedFirstPageUrl = `${BASE_URL}/${userB}/films${genrePath}/by/entry-rating/page/1/`;
  
  const [watchedFirstPageDoc, ratedFirstPageDoc] = await Promise.all([
      fetchPage(userBWatchedFirstPageUrl).catch(() => fetchPage(`${BASE_URL}/${userB}/films${genrePath}/`)),
      fetchPage(userBRatedFirstPageUrl).catch(() => fetchPage(`${BASE_URL}/${userB}/films${genrePath}/by/entry-rating/`))
  ]);
  
  const totalWatchedPages = getLastPage(watchedFirstPageDoc);
  const totalRatedPages = getLastPage(ratedFirstPageDoc);
  const totalBPages = totalWatchedPages + totalRatedPages;

  // Step 3: Scrape User B's watched films, contributing to the first part of the combined progress bar.
  const userBWatchedUrls = await scrapeUserPages(
    userB,
    'films',
    parseUserBFilms,
    onProgress,
    `Scraping ${userB}...`,
    genre, // Pass genre
    {
      firstPageDoc: watchedFirstPageDoc,
      progressOverride: { totalPages: totalBPages, pageOffset: 0 }
    }
  );

  // Step 4: Scrape User B's rated films, contributing to the second part of the combined progress bar.
  const userBRatedUrls = await scrapeUserPages(
    userB,
    'films/by/entry-rating',
    parseUserBFilms,
    onProgress,
    `Scraping ${userB}...`,
    genre, // Pass genre
    {
      firstPageDoc: ratedFirstPageDoc,
      progressOverride: { totalPages: totalBPages, pageOffset: totalWatchedPages }
    }
  );

  // Step 5: Compare and sort
  onProgress({ user: '', message: 'Comparing libraries...', currentPage: 0, totalPages: 0 });
  const userBUrlSet = new Set([...userBWatchedUrls, ...userBRatedUrls]);
  const recommendations: UserAMovie[] = userAMovies.filter(movie => !userBUrlSet.has(movie.url));
  recommendations.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));

  return recommendations;
};