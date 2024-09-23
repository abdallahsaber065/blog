// app/test/page.tsx
import { serialize } from 'next-mdx-remote/serialize';
import RenderMdx from '../../components/RenderMdx';

export default async function TestPage() {
  // MDX text - can be from a local file, database, anywhere
  const source = '# Some **mdx** text, with a component <TestComponent />';

  const mdxSource = await serialize(source);

  return (
    <div className="wrapper">
      <RenderMdx mdxSource={mdxSource} />
    </div>
  );
}