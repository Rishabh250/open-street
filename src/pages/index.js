import dynamic from 'next/dynamic';

const DynamicMapWithNoSSR = dynamic(() => import('../components/MapPage'), {
  ssr: false
});

const MapPage = () => {
  return <DynamicMapWithNoSSR />;
};

export default MapPage;
