import React, { Suspense } from 'react';
import { create } from 'react-test-renderer';
import { useLoader } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';
import FaceParticles from './FaceParticles';

jest.mock('#store');
jest.mock('react-three-fiber');

const mockUseLoader = useLoader as jest.Mock<any>;
const mockUseStore = useStore as jest.Mock<any>;

describe('components/FaceParticles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders FaceParticles', () => {
    mockUseStore.mockImplementation((cb) => {
      return cb({ face: { textureUrl: 'texture-url' } });
    });

    mockUseLoader.mockImplementationOnce(() => 'texture');

    const wrapper = create(
      <Suspense fallback={null}>
        <FaceParticles />
      </Suspense>,
    );

    expect(mockUseLoader).toHaveBeenCalledWith(TextureLoader, 'texture-url');
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
