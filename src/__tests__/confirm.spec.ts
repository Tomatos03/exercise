import { describe, expect, it } from 'vitest'
import { useConfirmService } from '../composables/useConfirmService'

describe('useConfirmService', () => {
  it('confirm 打开弹窗，answer(true) 后解析为 true', async () => {
    const { dialogOpen, current, confirm, answer } = useConfirmService()

    const result = confirm('要清空吗？', '清空')

    expect(dialogOpen.value).toBe(true)
    expect(current.value?.message).toBe('要清空吗？')
    expect(current.value?.confirmText).toBe('清空')

    answer(true)
    await expect(result).resolves.toBe(true)

    expect(dialogOpen.value).toBe(false)
    expect(current.value).toBeNull()
  })

  it('answer(false) 时解析为 false', async () => {
    const { confirm, answer } = useConfirmService()

    const result = confirm('要清空吗？')
    answer(false)

    await expect(result).resolves.toBe(false)
  })

  it('省略确认按钮文案时默认「确定」', () => {
    const { current, confirm } = useConfirmService()

    confirm('要清空吗？')

    expect(current.value?.confirmText).toBe('确定')
  })

  it('并发调用时排队依次处理，各自的 Promise 都拿到结果', async () => {
    const { dialogOpen, current, confirm, answer } = useConfirmService()

    const first = confirm('第一次')
    const second = confirm('第二次')

    expect(current.value?.message).toBe('第一次')

    answer(true)
    await expect(first).resolves.toBe(true)

    expect(dialogOpen.value).toBe(true)
    expect(current.value?.message).toBe('第二次')

    answer(false)
    await expect(second).resolves.toBe(false)

    expect(dialogOpen.value).toBe(false)
    expect(current.value).toBeNull()
  })
})
