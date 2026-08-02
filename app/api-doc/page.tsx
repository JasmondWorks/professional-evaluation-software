import { getApiDocs } from '../../lib/swagger';
import ReactSwagger from './react-swagger';

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container mx-auto mt-12 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-strong dark:text-white">API Documentation</h1>
      <ReactSwagger spec={spec} />
    </section>
  );
}
