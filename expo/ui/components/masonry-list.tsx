import type { ComponentProps } from 'react'
import React from 'react'
import MasonryBase from 'reanimated-masonry-list'

type BaseProps = ComponentProps<typeof MasonryBase>

export type MasonryListProps<T> = Omit<BaseProps, 'data' | 'renderItem'> & {
  data: T[]
  renderItem: (info: { item: T; i: number }) => React.ReactElement | null
}

export function MasonryList<T>({ data, renderItem, ...rest }: MasonryListProps<T>) {
  // `MasonryBase`'s typing may differ between versions; cast where necessary
  return <MasonryBase data={data as any} renderItem={renderItem as any} {...(rest as any)} />
}

export default MasonryList

