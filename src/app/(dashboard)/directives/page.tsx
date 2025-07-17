import { getDirectives } from '@/lib/data-service';
import DirectivesClient from './_components/directives-client';

export const dynamic = 'force-dynamic';

export default async function DirectivesPage() {
  const directives = await getDirectives();
  return (
    <div className="flex flex-col gap-6">
      <DirectivesClient initialDirectives={directives} />
    </div>
  );
}
