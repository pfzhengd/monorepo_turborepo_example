import type { Meta, StoryObj } from '@storybook/react'
import NuiDemo from './index'

const meta: Meta<typeof NuiDemo> = {
  title: 'Components/NuiDemo',
  component: NuiDemo,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof NuiDemo>

export const Basic: Story = {
  render: () => <NuiDemo />,
}
