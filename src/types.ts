import type { FoodOption, TravelOption } from "./constants";

export type RegistrationPayload = {
  fullName: string;
  mobile: string;
  travel: TravelOption;
  food: FoodOption;
  paymentConfirmed: boolean;
  paymentStatus: string;
  registrationFee: string;
  website: string;
};

export type SubmitSuccess = {
  ok: true;
};

export type SubmitFailure = {
  ok: false;
  error: string;
};

export type SubmitResult = SubmitSuccess | SubmitFailure;

export type FieldErrors = {
  fullName?: string;
  mobile?: string;
  travel?: string;
  food?: string;
  paymentConfirmed?: string;
};
