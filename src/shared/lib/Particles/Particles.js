import React from 'react';
import * as THREE from 'three';
import { useRender } from 'react-three-fiber';
import { getImageData } from './utils';
import Layout from './Layout';
import { useTexturesLoader } from './hooks';

const TEXTURE_URLS = [
  '/images/profile.png',
  '/images/character_n.png',
  '/images/character_y.png',
  '/images/character_a.png',
  '/images/character_v.png',
];

const Particles = () => {
  return <Layout />;
};

export default Particles;
