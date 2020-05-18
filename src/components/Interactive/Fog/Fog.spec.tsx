import React, { Suspense } from 'react';
import { create } from 'react-test-renderer';
import { useLoader } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';
import Fog from './Fog';

jest.mock('#store');
jest.mock('react-three-fiber');

const mockUseLoader = useLoader as jest.Mock<any>;
const mockUseStore = useStore as jest.Mock<any>;

describe('components/Fog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Fog', () => {
    mockUseStore.mockImplementation((cb) => {
      return cb({ fog: { textureUrl: 'texture-url' } });
    });

    mockUseLoader.mockImplementationOnce(() => 'texture');

    const wrapper = create(
      <Suspense fallback={null}>
        <Fog />
      </Suspense>,
    );

    expect(mockUseLoader).toHaveBeenCalledWith(TextureLoader, 'texture-url');
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
