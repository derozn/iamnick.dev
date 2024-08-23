import { HeroScene } from '@/modules/Interactive/Hero/Scene';
import { HolyGrail } from '@iamnick/ui/src/components/templates/HolyGrail';

export const dynamic = 'auto';

const Homepage = async () => {
  return (
    <HolyGrail>
      <div className="w-full">
        <section className="h-screen">
          <HeroScene />
        </section>
      </div>
    </HolyGrail>
  );
};

export default Homepage;
