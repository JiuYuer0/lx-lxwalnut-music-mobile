import TrackPlayer from 'react-native-track-player'
import settingState from '@/store/setting/state'
import { updateSetting } from '@/core/common'

/**
 * 伴唱（人声/伴奏混合）控制
 *
 * mix: 0 = 原声（人声正常）
 *      1 = 纯伴奏（人声消除）
 *    中间值 = 连续混合
 *
 * 实现基于原生层 VocalMixAudioProcessor（mid/side 相位抵消），
 * 开启时会自动关闭 audio offload，关闭时恢复原设置。
 */

let currentMix = 0

export const getVocalMix = () => currentMix

export const setVocalMix = async (mix: number) => {
  if (mix < 0) mix = 0
  if (mix > 1) mix = 1
  currentMix = mix
  await TrackPlayer.setVocalMix(mix)
}

export const setVocalMixEnabled = async (enabled: boolean) => {
  await updateSetting({ 'player.vocalMixEnabled': enabled })
  if (!enabled) {
    // 关闭时恢复原声并清掉内存中的滑动值
    currentMix = 0
    await TrackPlayer.setVocalMix(0)
  }
}

export const isVocalMixEnabled = () => settingState.setting['player.vocalMixEnabled']

/**
 * 播放器初始化后调用：若伴唱开关已打开但 mix 值丢失，则按开关状态恢复
 * （开关开 → 纯伴奏；开关关 → 原声）
 */
export const reapplyVocalMixIfNeeded = async () => {
  const target = settingState.setting['player.vocalMixEnabled'] ? (currentMix > 0 ? currentMix : 1) : 0
  if (target !== currentMix || target > 0) {
    currentMix = target
    await TrackPlayer.setVocalMix(target)
  }
}
