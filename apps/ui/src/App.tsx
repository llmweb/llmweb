import { useState, useEffect } from 'react';
import Page from './Page';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPath(window.location.hash);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return <Page flowChartUri={currentPath.replace(/^#\/?/, '')} />;
}
