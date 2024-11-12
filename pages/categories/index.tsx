import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
  return {
    redirect: {
      destination: '/categories/all',
      permanent: true,
    },
  };
};

// Component is never rendered, but needed for TypeScript
const CategoriesIndex = () => null;
export default CategoriesIndex; 