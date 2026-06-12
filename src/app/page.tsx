import { HeroScene } from '@/modules/Interactive/Hero/Scene';

export const dynamic = 'auto';

const Homepage = async () => {
  return (
    <main>
      <section className="h-screen w-full">
        <HeroScene />
      </section>
    </main>
  );
};

export default Homepage;
