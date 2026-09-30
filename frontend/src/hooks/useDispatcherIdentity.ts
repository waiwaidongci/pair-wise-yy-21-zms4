import { ref } from "vue";

export type DispatcherRole = "DISPATCHER" | "ADMIN";

export interface DispatcherIdentity {
  id: number;
  name: string;
  role: DispatcherRole;
}

const PRESETS: DispatcherIdentity[] = [
  { id: 1, name: "张调度", role: "DISPATCHER" },
  { id: 2, name: "李调度", role: "DISPATCHER" }
];

/** 当前坐席身份：切换后请求头携带 x-dispatcher-id，用于复现两位调度员并发保存。 */
const current = ref<DispatcherIdentity>({ ...PRESETS[0] });

export const useDispatcherIdentity = () => {
  const presets = PRESETS;
  const switchTo = (id: number) => {
    const preset = presets.find((item) => item.id === id);
    if (preset) current.value = { ...preset };
  };
  return { current, presets, switchTo };
};
