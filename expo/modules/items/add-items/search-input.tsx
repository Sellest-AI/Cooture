import { useDebounce } from "@/hooks";
import { Loader, Search } from "@ui/icons";
import { TextInput } from "@ui/text-input";
import { useEffect, useState } from "react";
import { ViewStyle } from "react-native";

type Props = {
  style?: ViewStyle;
  isLoading?: boolean;
  onValueChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  value?: string;
}

export const SearchInput = ({ value, style, isLoading, onValueChange, onBlur }: Props) => {
  // Search
  const [search, setSearch] = useState(value ?? "");
  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  useEffect(() => { setSearch(value ?? ''); }, [value]);

  useEffect(() => {
    if (onValueChange) onValueChange(query);
  }, [onValueChange, query])

  return (
    <TextInput
      startIcon={isLoading ? Loader : Search}
      value={search}
      onChangeText={setSearch}
      onBlur={(v) => onBlur?.(v)}
      placeholder="Search for items..."
      style={style}
      canClear
    />
  )
}