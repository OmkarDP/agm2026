import { useState, type FormEvent } from "react";
import { submitRegistration } from "../api/submitRegistration";
import {
  FOOD_OPTIONS,
  MESSAGES,
  PAYMENT_NO,
  PAYMENT_QUESTION,
  PAYMENT_YES,
  SUCCESS_MESSAGE,
  TRAVEL_OPTIONS,
  type FoodOption,
  type TravelOption,
} from "../constants";
import type { FieldErrors } from "../types";
import {
  normalizeMobile,
  normalizeName,
  validateRegistration,
} from "../validation";
import { PaymentSection } from "./PaymentSection";
import { RadioCardGroup } from "./RadioCardGroup";
import { StatusMessage } from "./StatusMessage";
import { TextField } from "./TextField";

const emptyForm = {
  fullName: "",
  mobile: "",
  travel: "" as TravelOption | "",
  food: "" as FoodOption | "",
  paymentStatus: "" as string,
  website: "",
};

type RegistrationFormProps = {
  onSuccess: () => void;
};

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [fullName, setFullName] = useState(emptyForm.fullName);
  const [mobile, setMobile] = useState(emptyForm.mobile);
  const [travel, setTravel] = useState<TravelOption | "">(emptyForm.travel);
  const [food, setFood] = useState<FoodOption | "">(emptyForm.food);
  const [paymentStatus, setPaymentStatus] = useState(emptyForm.paymentStatus);
  const [website, setWebsite] = useState(emptyForm.website);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSuccess(null);
    setFailure(null);

    const result = validateRegistration({
      fullName,
      mobile,
      travel,
      food,
      paymentConfirmed: paymentStatus !== "",
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await submitRegistration({
        fullName: normalizeName(fullName),
        mobile: normalizeMobile(mobile),
        travel: travel as TravelOption,
        food: food as FoodOption,
        paymentConfirmed: paymentStatus !== "",
        paymentStatus: paymentStatus,
        registrationFee: paymentStatus === PAYMENT_YES ? "१०००" : "०",
        website,
      });

      if (response.ok) {
        setFullName("");
        setMobile("");
        setTravel("");
        setFood("");
        setPaymentStatus("");
        setWebsite("");
        setSuccess(SUCCESS_MESSAGE);
        onSuccess();
        return;
      }

      setFailure(response.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
      aria-busy={submitting}
    >
      {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
      {failure ? <StatusMessage tone="error">{failure}</StatusMessage> : null}

      <div
        className="honeypot"
        aria-hidden="true"
      >
        <label htmlFor="website">वेबसाइट</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <TextField
        id="fullName"
        name="fullName"
        label="पूर्ण नाव"
        autoComplete="name"
        inputMode="text"
        placeholder="उदा. संतोष पाटील"
        value={fullName}
        error={errors.fullName}
        disabled={submitting}
        onChange={(event) => setFullName(event.target.value)}
      />

      <TextField
        id="mobile"
        name="mobile"
        label="मोबाईल क्रमांक"
        autoComplete="tel-national"
        inputMode="numeric"
        placeholder="१० अंकी मोबाईल क्रमांक"
        maxLength={10}
        value={mobile}
        error={errors.mobile}
        disabled={submitting}
        onChange={(event) =>
          setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
        }
      />

      <RadioCardGroup
        legend="आपण कोणत्या ठिकाणाहून प्रवास करणार आहात?"
        name="travel"
        value={travel}
        options={TRAVEL_OPTIONS}
        error={errors.travel}
        disabled={submitting}
        onChange={(value) => {
          setTravel(value);
          setErrors((current) => ({ ...current, travel: undefined }));
        }}
      />

      <RadioCardGroup
        legend="भोजनाची पसंती"
        name="food"
        value={food}
        options={FOOD_OPTIONS}
        error={errors.food}
        disabled={submitting}
        onChange={(value) => {
          setFood(value);
          setErrors((current) => ({ ...current, food: undefined }));
        }}
      />

      <PaymentSection />

      <RadioCardGroup
        legend={PAYMENT_QUESTION}
        name="paymentStatus"
        value={paymentStatus}
        options={[PAYMENT_YES, PAYMENT_NO]}
        error={errors.paymentConfirmed}
        disabled={submitting}
        singleColumn={true}
        onChange={(value) => {
          setPaymentStatus(value);
          setErrors((current) => ({ ...current, paymentConfirmed: undefined }));
        }}
      />

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-xl bg-forest px-6 text-base font-semibold text-white shadow-sm transition hover:bg-forest-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? MESSAGES.submitting : "नोंदणी करा"}
      </button>
    </form>
  );
}
