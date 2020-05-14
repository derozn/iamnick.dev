import React, { Suspense } from 'react';
import { create } from 'react-test-renderer';
import { useLoader } from 'react-three-fiber';

import useStore from '#store';

import Skull from './Skull';

jest.mock('#store');
jest.mock('react-three-fiber');

const mockUseStore = useStore as jest.Mock<any>; // Forgive me...
const mockUseLoader = useLoader as jest.Mock<any>; // And again...

// Will work on this..
describe('components/Skull', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skull', () => {
    mockUseStore.mockReturnValue(() => ({
      skull: { gltfUrl: '/gltf-url', textureUrl: '/texture-url' },
    }));

    mockUseLoader
      .mockImplementationOnce(() => 'texture')
      .mockImplementationOnce(() => ({
        scene: { children: [undefined, undefined, { name: 'skull-jaw' }, { name: 'skull-head' }] },
      }));

    const wrapper = create(
      <Suspense fallback={null}>
        <Skull />
      </Suspense>,
    );
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
