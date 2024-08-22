import { Scene } from '@/modules/Interactive/Scene';
import { HolyGrail } from '@iamnick/ui/src/components/templates/HolyGrail';

export const dynamic = 'auto';

const Homepage = async () => {
  return (
    <HolyGrail>
      <div className="w-full">
        <Scene />
      </div>
    </HolyGrail>
  );
};

export default Homepage;
