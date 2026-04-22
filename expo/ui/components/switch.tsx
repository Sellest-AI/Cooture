import { ComponentProps } from "react"
import { Switch as NativeSwitch } from "react-native"
import { Colors } from "theme"

type Props = {

} & ComponentProps<typeof NativeSwitch>

export const Switch = ({ value, ...props }: Props) => {
  return <NativeSwitch
    {...props}
    value={value}
    thumbColor={value ? Colors.primary[700] : Colors.neutral[400]}
    ios_backgroundColor={'black'}
    trackColor={{ false: Colors.blur.dark, true: Colors.primary[500] }}
  />
}