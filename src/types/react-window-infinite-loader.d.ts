declare module 'react-window-infinite-loader' {
  import { ComponentType, ReactNode } from 'react';
  import { FixedSizeList } from 'react-window';

  interface InfiniteLoaderProps {
    isItemLoaded: (index: number) => boolean;
    itemCount: number;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void> | void;
    threshold?: number;
    minimumBatchSize?: number;
    children: (props: {
      onItemsRendered: (params: {
        visibleStartIndex: number;
        visibleStopIndex: number;
        overscanStartIndex: number;
        overscanStopIndex: number;
      }) => void;
      ref: React.RefObject<FixedSizeList>;
    }) => ReactNode;
  }

  declare const InfiniteLoader: ComponentType<InfiniteLoaderProps>;
  export default InfiniteLoader;
}
