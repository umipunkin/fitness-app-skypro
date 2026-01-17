import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SuccessModal from "./SuccessModal.vue";

describe("SuccessModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("рендерит оверлей и сообщение", () => {
    const wrapper = mount(SuccessModal);

    expect(wrapper.find(".success-overlay").exists()).toBe(true);
    expect(wrapper.find(".success-title").text()).toBe("Ваш прогресс засчитан!");
  });

  it("вызывает emit('close') через 2 секунды", () => {
    const wrapper = mount(SuccessModal);

    vi.advanceTimersByTime(2000);

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("вызывает emit('close') при клике по оверлею", async () => {
    const wrapper = mount(SuccessModal);

    await wrapper.find(".success-overlay").trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("НЕ вызывает close при клике по внутреннему блоку", async () => {
    const wrapper = mount(SuccessModal);

    await wrapper.find(".success-content").trigger("click");

    expect(wrapper.emitted("close")).toBeFalsy();
  });
});
