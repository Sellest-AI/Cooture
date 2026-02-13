import { Button } from "@ui/button"
import { ArrowRight, Check, Clock9, Gift } from "@ui/icons"
import { Image } from "@ui/image"
import { ParallaxScrollView } from "@ui/parallax-scroll-view"
import { Pressable } from "@ui/pressable"
import { Text } from "@ui/text"
import { MotiView } from "moti"
import { ReactNode, useState } from "react"
import { View, ViewStyle } from "react-native"
import { Colors } from "theme"

type BadgeProps = {
  children: string,
  icon?: React.ComponentType<{ size?: number, color?: string }> | false,
  extra?: string,
  inverted?: boolean,
}
const Badge = ({ children, icon, extra, inverted }: BadgeProps) => {
  const Icon = icon;
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: inverted ? Colors.primary[900] : Colors.primary[500],
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
      width: 'auto',
      alignSelf: 'flex-start',
      borderRadius: 99,
    }}>
      {Icon && <Icon color={inverted ? Colors.primary[500] : Colors.primary[900]} size={16} />}
      <Text.Sm color={inverted ? Colors.primary[500] : Colors.primary[900]}>{children}</Text.Sm>
      {extra && <Text.Sm color={inverted ? Colors.primary[200] : Colors.primary[700]}>{extra}</Text.Sm>}
    </View>
  )
}

type CardProps = {
  style?: ViewStyle,
  icon: string | React.ComponentType<{ size?: number, color?: string }>,
  title: string,
  description: string | ReactNode,
}
const Card = ({ style, icon: Icon, title, description }: CardProps) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 20,
      ...style,
    }}>
      <View style={{
        borderRadius: 99,
        padding: 12,
        width: 50,
        height: 50,
        backgroundColor: Colors.blur.darkest,
        borderColor: Colors.blur.dark,
        borderTopWidth: 2,
        borderLeftWidth: 1,
        alignContent: 'center',
        justifyContent: 'center'
      }}>
        {typeof Icon === 'string' ? (
          <Text.Base style={{
            position: 'absolute',
            left: '50%',
            transform: [{ translateX: -1 }],
            fontSize: 20,
            lineHeight: 24
          }}>{Icon}</Text.Base>
        ) : (
          <Icon size={24} color={Colors.primary[200]} />
        )}
      </View>
      <View style={{ gap: 6, flex: 1 }}>
        <Text.Base color={Colors.neutral[50]} weight={700}>
          {title}
        </Text.Base>
        {typeof description === 'string' ? (
          <Text.Base color={Colors.neutral[400]} style={{ textBalance: true }}>
            {description}
          </Text.Base>
        ) : (description)}
      </View>
    </View>
  )
}

type CardPeriodProps = {
  onPress?: () => void,
  title?: string,
  children: string,
  extra?: string,
  selected?: boolean,
  badge?: {
    text: string,
    icon: React.ComponentType<{ size?: number, color?: string }>,
  }
}
const CardPeriod = ({ onPress, title, children, extra, badge, selected }: CardPeriodProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 164,
        flex: 1,
      }}
    >
      <MotiView
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingTop: 20,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderTopWidth: 2,
          borderLeftWidth: 1,
          borderRadius: 24,
          borderWidth: selected ? 1 : 0,
          borderColor: selected ? Colors.primary[500] : Colors.blur.medium,
        }}
        animate={{
          backgroundColor: selected ? Colors.primary[900] : Colors.blur.dark,
        }}
      >
        <View style={{ marginBottom: 20 }}>
          <Text.Base color={selected ? Colors.primary[200] : Colors.neutral[200]} style={{ marginBottom: 2 }}>
            {title}
          </Text.Base>
          <Text.H3 color={selected ? Colors.primary[500] : Colors.neutral[50]} style={{ marginBottom: 12 }}>
            {children}
          </Text.H3>
          {badge && <Badge icon={badge.icon}>{badge.text}</Badge>}
        </View>
        {extra && <Text.Sm color={selected ? Colors.primary[700] : Colors.neutral[400]}>
          {extra}
        </Text.Sm>}
        {selected && <View style={{
          position: 'absolute',
          top: -6,
          right: -6,
          borderRadius: 99,
          padding: 4,
          backgroundColor: Colors.primary[500],
        }}>
          <Check color={Colors.primary[900]} size={20} />
        </View>}
      </MotiView>
    </Pressable>
  )
}

export default function Screen() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');

  return <View style={{ flex: 1 }}>
    <ParallaxScrollView
      headerBackground={
        <Image
          contentPosition="center"
          source={require('assets/backgrounds/metro-boy.jpg')}
          style={{ opacity: 0.3, position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
        />
      }
      headerContent={<View style={{ height: 224 }} />}
      contentNegativeSpace={212}
    >
      <View style={{ padding: 12, paddingBottom: 20, paddingTop: 40 }}>
        <Badge
          icon={Clock9}
          extra="-35%"
          inverted
        >
          Limited Offer
        </Badge>
        <Text.H1 type="alt" color={Colors.primary[200]} style={{ marginTop: 16 }}>
          Unlock
        </Text.H1>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
          <View>
            <Text.Max
              style={{ color: Colors.primary[700], position: 'absolute', marginTop: 4 }}
            >
              Cooture
            </Text.Max>
            <Text.Max style={{ color: Colors.primary[500], position: 'relative' }}>
              Cooture
            </Text.Max>
          </View>
          <Text.H1 type="alt" color={Colors.primary[200]} style={{ marginBottom: 4 }}>
            Max
          </Text.H1>
        </View>
      </View>
      <View style={{ paddingHorizontal: 12 }}>
        <Text.Base color={Colors.neutral[400]} style={{ marginBottom: 20 }} weight={600}>
          What&apos;s included?
        </Text.Base>
        <Card
          icon={"💎"}
          title="Weekly free credits"
          description={
            <Text.Base color={Colors.neutral[400]}>
              Receive <Text.Base weight={700} color={Colors.neutral[200]}>100 💎</Text.Base> every week
            </Text.Base>
          }
          style={{ marginBottom: 24 }}
        />
        <Card
          icon={"🎨"}
          title="Custom Presets"
          description="Turn any image into a replicable preset"
          style={{ marginBottom: 24 }}
        />
        <Card
          icon={"⚡"}
          title="Better Rewards"
          description="3x more credits when completing a quest."
          style={{ marginBottom: 24 }}
        />
        <Card
          icon={"🏷️"}
          title="Reduced Fees"
          description="30% on all generations"
          style={{ marginBottom: 24 }}
        />
      </View>
    </ParallaxScrollView>
    <View
      style={{
        paddingHorizontal: 12,
        paddingBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <CardPeriod
          title="Weekly"
          extra="Billed Weekly"
          selected={period === 'weekly'}
          onPress={() => setPeriod('weekly')}
        >
          4.99 €
        </CardPeriod>
        <CardPeriod
          onPress={() => setPeriod('monthly')}
          selected={period === 'monthly'}
          title="Monthly"
          extra="Cancel anytime"
          badge={{
            icon: Gift,
            text: "35% Off"
          }}
        >
          12.99 €
        </CardPeriod>
      </View>
      <Button
        style={{ marginTop: 12 }}
        variant="primary"
        endIcon={ArrowRight}
      >
        Upgrade to max
      </Button>
    </View>
  </View>
}