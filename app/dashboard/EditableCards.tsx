/**
 * The dashboard cards the signed-in member can edit in place: My car and Emergency contact.
 *
 * @author Colin Hermack
 */

"use client";

import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";

import { SideCard } from "./SideCard";

import { CarDataDTO, EmergencyDataDTO } from "@/dtos/memberDto";
import {
  formatPhone,
  Parsed,
  parseCar,
  parseEmergencyContact,
} from "@/utils/memberForms";
import { ProtectedResult, protectedFetch } from "@/utils/protectedFetch";

type CarDraft = {
  nickname: string;
  model: string;
  seats: string;
  hitch: boolean;
};

type ContactDraft = {
  name: string;
  relation: string;
  phone: string;
  email: string;
};

function putJson<T>(url: string, value: unknown): Promise<ProtectedResult<T>> {
  return protectedFetch<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}

/**
 * Draft, validation and save state for one inline form. While the form is open `draft` is non-null. Closing it moves
 * focus back to the button that opened it (`triggerRef`).
 */
function useEditForm<D extends object>() {
  const [draft, setDraft] = useState<D | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (draft === null && wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = draft !== null;
  }, [draft]);

  return {
    draft,
    errors,
    saving,
    failed,
    triggerRef,
    open(initial: D) {
      setDraft(initial);
      setErrors({});
      setFailed(false);
    },
    close: () => setDraft(null),
    set<K extends keyof D>(key: K) {
      return (value: D[K]) => setDraft((d) => d && { ...d, [key]: value });
    },
    async submit<V, T>(
      parsed: Parsed<V>,
      send: (value: V) => Promise<ProtectedResult<T>>,
      onOk: (data: T) => void,
    ) {
      if (!parsed.ok) {
        setErrors(parsed.errors);

        return;
      }

      setErrors({});
      setFailed(false);
      setSaving(true);
      const result = await send(parsed.value);

      setSaving(false);

      if (result.status === "ok") {
        onOk(result.data);
        setDraft(null);
      } else {
        setFailed(true);
      }
    },
  };
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  placeholder,
  autoFocus,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "numeric" | "email";
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <TextField
      autoFocus={autoFocus}
      className={className}
      inputMode={inputMode}
      isInvalid={Boolean(error)}
      type={type}
      value={value}
      onChange={onChange}
    >
      <Label>{label}</Label>
      <Input className="h-11 sm:h-10 border border-border" placeholder={placeholder} />
      <FieldError>{error}</FieldError>
    </TextField>
  );
}

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

/**
 * Save and Cancel, plus an optional destructive action. On phones Cancel and Save split the row and the destructive
 * action sits full width below; from `sm` up it moves to the left.
 */
function FormFooter({
  saveLabel,
  saving,
  failed,
  onCancel,
  remove,
}: {
  saveLabel: string;
  saving: boolean;
  failed: boolean;
  onCancel: () => void;
  remove?: { label: string; onPress: () => void };
}) {
  return (
    <>
      {failed ? (
        <p className="text-sm font-medium text-danger" role="alert">
          Couldn&#39;t save. Try again.
        </p>
      ) : null}
      <div className="mt-1 pt-3 border-t border-border flex flex-wrap items-center justify-end gap-2">
        {remove ? (
          <Button
            className="order-last w-full sm:order-first sm:w-auto sm:mr-auto text-danger"
            isDisabled={saving}
            variant="ghost"
            onPress={remove.onPress}
          >
            {remove.label}
          </Button>
        ) : null}
        <Button
          className="flex-1 sm:flex-none"
          isDisabled={saving}
          variant="outline"
          onPress={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 sm:flex-none"
          isPending={saving}
          type="submit"
          variant="primary"
        >
          {saveLabel}
        </Button>
      </div>
    </>
  );
}

const CAR_URL = "/api/protected/user/car";

export function CarCard({
  car,
  onSaved,
}: {
  car?: CarDataDTO;
  onSaved: (car?: CarDataDTO) => void;
}) {
  const form = useEditForm<CarDraft>();
  const { draft } = form;
  const adding = !car;

  const openForm = () =>
    form.open({
      nickname: car?.nickname ?? "",
      model: car?.model ?? "",
      seats: car?.capacity ?? "",
      hitch: car?.hitch ?? false,
    });

  return (
    <SideCard
      aside={
        car && !draft ? (
          <Button
            ref={form.triggerRef}
            aria-label="Edit car"
            size="sm"
            variant="outline"
            onPress={openForm}
          >
            <PencilIcon />
            Edit
          </Button>
        ) : null
      }
      title={draft ? (adding ? "Add a car" : "Edit car") : "My car"}
    >
      {draft ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            form.submit(
              parseCar(draft),
              (value) => putJson<CarDataDTO>(CAR_URL, value),
              onSaved,
            );
          }}
        >
          <Field
            autoFocus
            error={form.errors.nickname}
            label="Nickname (optional)"
            value={draft.nickname}
            onChange={form.set("nickname")}
          />
          <Field
            error={form.errors.model}
            label="Year, make and model"
            placeholder="2019 Subaru Outback"
            value={draft.model}
            onChange={form.set("model")}
          />
          <Field
            className="w-[120px]"
            error={form.errors.seats}
            inputMode="numeric"
            label="Seats, including driver"
            type="number"
            value={draft.seats}
            onChange={form.set("seats")}
          />
          <Select
            className="w-[120px]"
            value={draft.hitch ? "yes" : "no"}
            onChange={(value) => form.set("hitch")(value === "yes")}
          >
            <Label>Has a tow hitch</Label>
            <Select.Trigger className="h-11 sm:h-10 border border-border">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="yes" textValue="Yes">
                  Yes
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="no" textValue="No">
                  No
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <FormFooter
            failed={form.failed}
            remove={
              adding
                ? undefined
                : {
                    label: "Remove car",
                    onPress: () =>
                      form.submit(
                        { ok: true, value: null },
                        () =>
                          protectedFetch<null>(CAR_URL, { method: "DELETE" }),
                        () => onSaved(undefined),
                      ),
                  }
            }
            saveLabel={adding ? "Add car" : "Save"}
            saving={form.saving}
            onCancel={form.close}
          />
        </form>
      ) : car ? (
        <>
          <span className="font-semibold">
            {car.nickname || car.model || "My car"}
          </span>
          <span className="text-sm text-muted">
            {[
              car.nickname ? car.model : "",
              car.capacity ? `${car.capacity} seats` : "",
              car.hitch ? "Tow hitch" : "No hitch",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </>
      ) : (
        <>
          <span className="text-sm text-muted">
            No car on file. Adding yours helps trip leaders plan rides.
          </span>
          <Button
            ref={form.triggerRef}
            className="self-start mt-1"
            variant="outline"
            onPress={openForm}
          >
            Add a car
          </Button>
        </>
      )}
    </SideCard>
  );
}

export function EmergencyContactCard({
  contact,
  onSaved,
}: {
  contact?: EmergencyDataDTO;
  onSaved: (contact: EmergencyDataDTO) => void;
}) {
  const form = useEditForm<ContactDraft>();
  const { draft } = form;
  const hasContact = Boolean(contact?.name);

  const openForm = () =>
    form.open({
      name: contact?.name ?? "",
      relation: contact?.relation ?? "",
      phone: (contact?.phone ?? "").replace(/\D/g, ""),
      email: contact?.email ?? "",
    });

  return (
    <SideCard
      aside={
        hasContact && !draft ? (
          <Button
            ref={form.triggerRef}
            aria-label="Edit emergency contact"
            size="sm"
            variant="outline"
            onPress={openForm}
          >
            <PencilIcon />
            Edit
          </Button>
        ) : null
      }
      title={
        draft
          ? hasContact
            ? "Edit emergency contact"
            : "Add emergency contact"
          : "Emergency contact"
      }
    >
      {draft ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            form.submit(
              parseEmergencyContact(draft),
              (value) =>
                putJson<EmergencyDataDTO>(
                  "/api/protected/user/emergencycontact",
                  value,
                ),
              onSaved,
            );
          }}
        >
          <Field
            autoFocus
            error={form.errors.name}
            label="Name"
            value={draft.name}
            onChange={form.set("name")}
          />
          <Field
            error={form.errors.relation}
            label="Relationship"
            placeholder="Parent, sibling, partner"
            value={draft.relation}
            onChange={form.set("relation")}
          />
          <Field
            error={form.errors.phone}
            inputMode="numeric"
            label="Phone"
            placeholder="7655550142"
            type="tel"
            value={draft.phone}
            onChange={(v) =>
              form.set("phone")(v.replace(/\D/g, "").slice(0, 10))
            }
          />
          <Field
            error={form.errors.email}
            inputMode="email"
            label="Email (optional)"
            type="email"
            value={draft.email}
            onChange={form.set("email")}
          />
          <FormFooter
            failed={form.failed}
            saveLabel="Save"
            saving={form.saving}
            onCancel={form.close}
          />
        </form>
      ) : hasContact && contact ? (
        <>
          <span className="font-semibold">{contact.name}</span>
          <span className="text-sm text-muted">
            {[contact.relation, formatPhone(contact.phone), contact.email]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </>
      ) : (
        <>
          <span className="text-sm text-muted">
            No emergency contact on file.
          </span>
          <Button
            ref={form.triggerRef}
            className="self-start mt-1"
            variant="outline"
            onPress={openForm}
          >
            Add emergency contact
          </Button>
        </>
      )}
    </SideCard>
  );
}
