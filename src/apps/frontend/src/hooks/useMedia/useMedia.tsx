import { useState, useEffect } from 'react';

const removeMediaFromQuery = (query: string) => query.replace(/^@media( ?)/m, '');

const useMedia = (query: string, defaultMatch: boolean) => {
  const supportMatchMedia =
    typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined';

  const matchQuery = removeMediaFromQuery(query);

  const [match, setMatch] = useState<boolean>(() => {
    if (supportMatchMedia) {
      return window.matchMedia(matchQuery).matches;
    }

    return defaultMatch;
  });

  useEffect(() => {
    if (!supportMatchMedia) {
      return undefined;
    }

    const queryList = window.matchMedia(matchQuery);

    const updateMatch = () => {
      setMatch(queryList.matches);
    };

    updateMatch();

    queryList.addListener(updateMatch);

    return () => {
      queryList.removeListener(updateMatch);
    };
  }, [matchQuery, supportMatchMedia]);

  return match;
};

export default useMedia;
