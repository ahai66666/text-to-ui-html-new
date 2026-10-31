import { renderMarkup } from '../shared/render-markup.js';
import { attrs } from "../shared/advanced-attrs.js";

export const inputOtp = () => `<fieldset class="tui-component tui-input-otp" ${attrs("input-otp", "Input OTP/Default")}><legend data-typography-role="body-m">验证码</legend><div class="tui-input-otp__cells">${[1, 2, 3, 4, 5, 6].map((n) => `<input class="tui-input-otp__cell" type="text" inputmode="numeric" maxlength="1" aria-label="第 ${n} 位验证码" data-typography-role="body-l" />`).join("")}</div><small data-typography-role="body-s">请输入 6 位验证码</small></fieldset>`;

export const componentId = "input-otp";
const renderer = inputOtp;
export const render = (options) => renderMarkup(componentId, options, renderer);
export default render;
