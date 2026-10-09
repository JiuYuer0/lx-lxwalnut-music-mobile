import { memo, useCallback, useRef, useState } from 'react'
import { View, Text, PanResponder } from 'react-native'
import { useSettingValue } from '@/store/setting/hook'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Btn from './Btn'
import { setVocalMix, getVocalMix } from '@/plugins/player/vocalMix'

/**
 * 伴唱（人声/伴奏切换）按钮 + 滑块
 *
 * 点击按钮：开/关伴唱模式（开=纯伴奏，关=原声）
 * 按钮出现时下方显示滑块，可在人声↔伴奏之间连续滑动
 */
export default memo(() => {
  const enabled = useSettingValue('player.vocalMixEnabled')
  const theme = useTheme()
  const [sliderVisible, setSliderVisible] = useState(false)
  const [mix, setMix] = useState(0)
  const [dragging, setDragging] = useState(false)
  const widthRef = useRef(1)
  const lastSentRef = useRef(0)

  const showSlider = useCallback(() => {
    setSliderVisible((v) => {
      const next = !v
      if (next) setMix(getVocalMix())
      return next
    })
  }, [])

  const sendMix = useCallback((value: number) => {
    // 拖动时节流：与上次发送值差异过小则跳过
    if (Math.abs(value - lastSentRef.current) < 0.02 && value !== 0 && value !== 1) return
    lastSentRef.current = value
    void setVocalMix(value)
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        setDragging(true)
        handlePosition(evt.nativeEvent.locationX)
      },
      onPanResponderMove: (evt) => {
        handlePosition(evt.nativeEvent.locationX)
      },
      onPanResponderRelease: () => {
        setDragging(false)
      },
    })
  ).current

  const handlePosition = (locationX: number) => {
    const w = widthRef.current
    if (w <= 0) return
    let value = locationX / w
    if (value < 0) value = 0
    if (value > 1) value = 1
    setMix(value)
    sendMix(value)
  }

  const onToggle = useCallback(() => {
    if (!sliderVisible) {
      // 第一次点击：显示滑块并直接进入伴奏模式
      showSlider()
      setMix(1)
      lastSentRef.current = 1
      void setVocalMix(1)
    } else {
      showSlider()
    }
  }, [sliderVisible, showSlider])

  const iconColor = enabled && mix > 0 ? theme['c-primary'] : undefined

  return (
    <View style={styles.container}>
      <Btn icon="svg:vocal-mix" color={iconColor} onPress={onToggle} />
      {sliderVisible ? (
        <View style={styles.sliderWrap}>
          <View style={styles.trackRow}>
            <Text style={{ ...styles.label, color: theme['c-font-label'] }}>人声</Text>
            <View
              style={styles.track}
              onLayout={(e) => {
                widthRef.current = e.nativeEvent.layout.width
              }}
              {...panResponder.panHandlers}
            >
              <View style={styles.trackBg} />
              <View
                style={{
                  ...styles.trackActive,
                  backgroundColor: theme['c-primary'],
                  width: `${mix * 100}%`,
                }}
              />
              <View
                style={{
                  ...styles.thumb,
                  backgroundColor: theme['c-primary'],
                  left: `${mix * 100}%`,
                  opacity: dragging ? 1 : 0.9,
                }}
              />
            </View>
            <Text style={{ ...styles.label, color: theme['c-font-label'] }}>伴奏</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sliderWrap: {
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 2,
    marginBottom: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    paddingHorizontal: 6,
  },
  track: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
  },
  trackActive: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 12 - 7,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
})