'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'loading'> {
  /**
   * The threshold value for the Intersection Observer
   * A value of 0 means the image will start loading as soon as
   * any part of it enters the viewport
   */
  threshold?: number;
  
  /**
   * The root margin value for the Intersection Observer
   * A positive value will start loading the image before it
   * enters the viewport, useful for preloading
   */
  rootMargin?: string;
}