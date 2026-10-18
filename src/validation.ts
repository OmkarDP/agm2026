import {
  FOOD_OPTIONS,
  MESSAGES,
  TRAVEL_OPTIONS,
  type FoodOption,
  type TravelOption,
} from "./constants";
import type { FieldErrors } from "./types";

export const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

export function isTravelOption(value: string): value is TravelOption {
  return (TRAVEL_OPTIONS as readonly string[]).includes(value);
}

export function isFoodOption(value: string): value is FoodOption {
  return (FOOD_OPTIONS as readonly string[]).includes(value);
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateRegistration(input: {
  fullName: string;
  mobile: string;
  travel: string;
  food: string;
  paymentConfirmed: boolean;
}): { ok: true } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const fullName = normalizeName(input.fullName);
  const mobile = normalizeMobile(input.mobile);

  if (!fullName) {
    errors.fullName = MESSAGES.nameRequired;
  }

  if (!mobile) {
    errors.mobile = MESSAGES.mobileRequired;
  } else if (!MOBILE_PATTERN.test(mobile)) {
    errors.mobile = MESSAGES.mobileInvalid;
  }

  if (!isTravelOption(input.travel)) {
    errors.travel = MESSAGES.travelRequired;
  }

  if (!isFoodOption(input.food)) {
    errors.food = MESSAGES.foodRequired;
  }

  if (!input.paymentConfirmed) {
    errors.paymentConfirmed = MESSAGES.paymentRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}
