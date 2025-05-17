'use client';

import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Skeleton } from '@/components/ui/skeleton';

export interface Column<T = unknown> {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (item: T) => React.ReactNode;
}

interface VirtualizedListProps<T = unknown> {
  columns: Column<T>[];
  items: T[];
  isLoading: boolean;
  loadNextPage: () => void;
  onRowClick?: (item: T) => void;
  containerHeight?: number;
  rowHeight?: number;
  hasNextPage?: boolean;
}

/**
 * A virtualized list component that efficiently renders large sets of data
 * using react-window and react-window-infinite-loader for pagination.
 */
export const VirtualizedList = memo(function VirtualizedList<T>({
  columns,
  items = [],
  isLoading,
  loadNextPage,
  onRowClick,
  containerHeight = 500,
  rowHeight = 56,
  hasNextPage = true,
}: VirtualizedListProps<T>) {
  const infiniteLoaderRef = useRef<InfiniteLoader>(null);
  const listRef = useRef<List>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate total width and column widths
  const totalFlex = columns.reduce((acc, col) => acc + (col.flex || 0), 0);

  // Reset list when items change
  useEffect(() => {
    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache?.();
    }
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [items.length]);

  // Determine if an item at a given index needs to be loaded
  const isItemLoaded = useCallback(
    (index: number) => {
      return !hasNextPage || index < items.length;
    },
    [hasNextPage, items.length],
  );

  // Load more items when scrolling to the bottom
  const loadMoreItems = useCallback(() => {
    if (isLoading) return Promise.resolve();
    return new Promise<void>(resolve => {
      loadNextPage();
      resolve();
    });
  }, [isLoading, loadNextPage]);

  // Render header row
  const renderHeader = useCallback(() => {
    return (
      <div
        className="flex items-center border-b bg-muted/30 font-medium text-muted-foreground py-2"
        style={{ height: rowHeight }}
      >
        {columns.map((column, index) => {
          const width = column.width
            ? column.width
            : column.flex
              ? `${(column.flex / totalFlex) * 100}%`
              : 'auto';
          return (
            <div
              key={`header-${index}`}
              className="px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ width, minWidth: column.width || 80 }}
            >
              {column.headerName}
            </div>
          );
        })}
      </div>
    );
  }, [columns, rowHeight, totalFlex]);

  // Render a row
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (!isItemLoaded(index)) {
        // Loading placeholder row
        return (
          <div style={style} className="flex items-center border-b animate-pulse">
            {columns.map((column, colIndex) => {
              const width = column.width
                ? column.width
                : column.flex
                  ? `${(column.flex / totalFlex) * 100}%`
                  : 'auto';
              return (
                <div
                  key={`loading-${index}-${colIndex}`}
                  className="px-4 py-2"
                  style={{ width, minWidth: column.width || 80 }}
                >
                  <Skeleton className="h-4 w-full" />
                </div>
              );
            })}
          </div>
        );
      }

      const item = items[index];
      if (!item) return null;

      return (
        <div
          style={style}
          className={`flex items-center border-b ${
            hoveredIndex === index ? 'bg-muted/20' : ''
          } ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick && item && onRowClick(item)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {columns.map((column, colIndex) => {
            const width = column.width
              ? column.width
              : column.flex
                ? `${(column.flex / totalFlex) * 100}%`
                : 'auto';
            const value =
              item && typeof item === 'object' && column.field in (item as object)
                ? (item as Record<string, unknown>)[column.field]
                : undefined;

            return (
              <div
                key={`${index}-${colIndex}`}
                className="px-4 py-2 overflow-hidden"
                style={{ width, minWidth: column.width || 80 }}
              >
                {column.renderCell ? column.renderCell(item) : (value as React.ReactNode)}
              </div>
            );
          })}
        </div>
      );
    },
    [columns, items, isItemLoaded, onRowClick, hoveredIndex, totalFlex],
  );

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col border rounded-md overflow-hidden">
        {renderHeader()}
        <div style={{ height: containerHeight }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center border-b animate-pulse"
              style={{ height: rowHeight }}
            >
              {columns.map((column, colIndex) => {
                const width = column.width
                  ? column.width
                  : column.flex
                    ? `${(column.flex / totalFlex) * 100}%`
                    : 'auto';
                return (
                  <div
                    key={`initial-loading-${i}-${colIndex}`}
                    className="px-4 py-2"
                    style={{ width, minWidth: column.width || 80 }}
                  >
                    <Skeleton className="h-4 w-full" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border rounded-md overflow-hidden">
      {renderHeader()}
      <div style={{ height: containerHeight }}>
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={hasNextPage ? items.length + 1 : items.length}
          loadMoreItems={loadMoreItems}
          threshold={5}
        >
          {({ onItemsRendered, ref }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  ref={listInstance => {
                    if (typeof ref === 'function') {
                      ref(listInstance);
                    }
                    listRef.current = listInstance as List;
                  }}
                  height={containerHeight}
                  width={width}
                  itemCount={hasNextPage ? items.length + 1 : items.length}
                  itemSize={rowHeight}
                  onItemsRendered={onItemsRendered}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    </div>
  );
});

export type { Column };
