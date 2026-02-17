import { Block } from "@ui/block";
import CurvedText from "@ui/curved-text";
import { Check, Credits } from "@ui/icons";
import { Skeleton } from "@ui/skeleton";
import { ComponentProps } from "react";
import { View, ViewStyle } from "react-native";
import { Colors, Texts } from "theme";
import { Image } from "../image";
import { Text } from '../text';

const QuestBadge = (props: { source?: ComponentProps<typeof Image>['source'], amount: number }) => {
  const amount = props.amount;
  const textLength = amount.toString().length;
  const startOffset = 45 - (textLength - 1) * 7; // Adjust the startOffset based on the number of digits
  const marginTop = textLength === 1 ? 51 : 67;
  const curvature = textLength === 1 ? 0 : 0.3;

  return (
    <View style={{
      width: 100,
      height: 100,
    }}>
      <Image
        source={props.source}
        contentFit={"contain"}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      <View style={{
        flex: 1,
        width: '100%',
        height: 30,
        marginLeft: -2,
        marginTop: marginTop,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
      }}>
        <CurvedText
          text={amount.toString()}
          width={150}
          height={100}
          fontSize={22}
          fontWeight={700}
          curvature={curvature}
          fill={Colors.primary[900]}
          fontFamily={Texts.h3.alt.fontFamily}
          startOffset={`${startOffset}%`}
        />
      </View>
    </View>
  )
}

type Props = {
  style?: ViewStyle;
  source?: ComponentProps<typeof Image>['source'];
  title: string;
  description: string;
  progress: { completed: number; total: number };
  credits?: number;
  claimed?: boolean;
}

export const Quest = ({ style, source, title, description, progress, credits, claimed }: Props) => {
  const progressPercentage = Math.min(100, (progress.completed / progress.total) * 100);
  const completed = claimed || progress.completed >= progress.total;

  return (
    <View style={{
      alignItems: 'center',
      ...style,
    }}>
      <QuestBadge
        source={source}
        amount={progress.total}
      />
      {/* <Image
        source={source}
        contentFit={"contain"}
        style={{
          width: 100,
          height: 100,
        }}
      /> */}
      <Text.Base color={Colors.neutral[50]} weight={600} style={{ marginTop: 12, width: '95%', textAlign: 'center' }} numberOfLines={1}>
        {title}
      </Text.Base>
      <Text.Sm color={Colors.neutral[400]} style={{
        marginTop: 6,
        width: '95%',
        textAlign: 'center',
        paddingBottom: 2,
      }}
        numberOfLines={2}
      >
        {progress.completed} / {progress.total} {description}
      </Text.Sm>
      <View style={{
        marginTop: 10,
        maxWidth: 85,
        width: '100%',
        height: 4,
        backgroundColor: Colors.primary[900],
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${progressPercentage}%`,
          height: '100%',
          backgroundColor: Colors.primary[500],
        }}
        />
      </View>
      {credits && <Block
        variant={completed ? "primary" : "blur"}
        style={{
          marginTop: 16,
          flexDirection: 'row',
          gap: 4,
          paddingLeft: 8,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 5,
          borderRadius: 99,
        }}>
        {completed ? <Check size={14} /> : <Credits size={14} />}
        <Text.Sm color={completed ? Colors.primary[700] : Colors.neutral[200]} weight={600}>
          {credits}
        </Text.Sm>
      </Block>}
    </View>
  )
}

const QuestSkeleton = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={{
      alignItems: 'center',
      ...style,
    }}>
      <Skeleton width={100} height={100} radius={999} />
      <Skeleton width={80} height={18} radius={4} style={{ marginTop: 12 }} />
      <Skeleton width={60} height={14} radius={4} style={{ marginTop: 6 }} />
      <Skeleton width={'100%'} height={4} radius={99} style={{ marginTop: 12, maxWidth: 85 }} />
    </View>
  )
}

Quest.Skeleton = QuestSkeleton;