"use client";

/**
 * A dashboard page which will be accessible to authorized users and allow management of existing trip leaders
 * and addition of new trip leaders.
 *
 * @author Colin Hermack
 */

import { useState, useEffect, useMemo } from "react";
import type { Selection } from "@heroui/react";
import TripLeaderDTO from "@/dtos/tripLeaderDto";
import { SPORTS, PSEUDO_SPORTS } from "@/config/constants";
import { redirect } from "next/navigation";

import { Button, Modal, Table, TextField, Input, cn, Checkbox, CheckboxGroup, Label } from "@heroui/react";

type NestedRow = {
  children: NestedRow[];
  field: string;
  id: string;
  value: string;
};

export default function TripLeaderDashboardPage() {
  const [tripLeaders, setTripLeaders] = useState<TripLeaderDTO[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLeader, setSelectedLeader] = useState<TripLeaderDTO | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Selection>(() => new Set());
  const [processValues, setProcessValues] = useState<string[]>([]);
  const [sportValues, setSportValues] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const p = selectedLeader?.process;

    setProcessValues([
      ...(p?.shadow ? ["shadowed"] : []),
      ...(p?.approved ? ["approved"] : []),
      ...(p?.certified ? ["certified"] : []),
    ]);
    setSportValues(selectedLeader?.sport ?? []);
  }, [selectedLeader]);

  const isDirty = useMemo(() => {
    const p = selectedLeader?.process;
    const sportsDirty =
      [...sportValues].sort().join(",") !==
      [...(selectedLeader?.sport ?? [])].sort().join(",");

    return (
      sportsDirty ||
      processValues.includes("shadowed") !== (p?.shadow ?? false) ||
      processValues.includes("approved") !== (p?.approved ?? false) ||
      processValues.includes("certified") !== (p?.certified ?? false)
    );
  }, [processValues, sportValues, selectedLeader]);

  const handleSave = async () => {
    if (!selectedLeader?.member?.id) return;

    setIsSaving(true);

    const body = {
      memberId: selectedLeader.member.id,
      sport: sportValues,
      process: {
        shadow: processValues.includes("shadowed"),
        approved: processValues.includes("approved"),
        certified: processValues.includes("certified"),
      },
      gmail: selectedLeader.gmail
    };

    const response = await fetch("/api/protected/tripleaders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsSaving(false);

    if (!response.ok) return;

    const updated: TripLeaderDTO = await response.json();

    setTripLeaders((prev) =>
      (prev ?? []).map((tl) =>
        tl.member?.id === updated.member?.id ? updated : tl,
      ),
    );
    setSelectedLeader(updated);
  };

  const handleRowAction = (key: React.Key) => {
    const leader = (tripLeaders ?? []).find((tl) => tl.member?.name === key);

    if (leader) {
      setSelectedLeader(leader);
      setExpandedKeys(new Set());
      setIsModalOpen(true);
    }
  };

  const nestedData = useMemo((): NestedRow[] => {
    if (!selectedLeader) return [];

    const m = selectedLeader.member;

    return [
      {
        id: "firstAid",
        field: "First Aid",
        value: "",
        children: [
          {
            id: "firstAid-type",
            field: "Type",
            value: m?.firstAidData?.type ?? "—",
            children: [],
          },
          {
            id: "firstAid-expires",
            field: "Expires",
            value: m?.firstAidData?.expires ?? "—",
            children: [],
          },
          {
            id: "firstAid-verified",
            field: "Verified",
            value:
              m?.firstAidData?.verified === undefined
                ? "—"
                : m.firstAidData.verified
                  ? "Yes"
                  : "No",
            children: [],
          },
        ],
      },
      {
        id: "emergency",
        field: "Emergency Contact",
        value: "",
        children: [
          {
            id: "emergency-name",
            field: "Name",
            value: m?.emergencyData?.name ?? "—",
            children: [],
          },
          {
            id: "emergency-email",
            field: "Email",
            value: m?.emergencyData?.email ?? "—",
            children: [],
          },
          {
            id: "emergency-phone",
            field: "Phone",
            value: m?.emergencyData?.phone ?? "—",
            children: [],
          },
          {
            id: "emergency-relation",
            field: "Relation",
            value: m?.emergencyData?.relation ?? "—",
            children: [],
          },
        ],
      },
      {
        id: "medical",
        field: "Medical",
        value: "",
        children: [
          {
            id: "medical-allergies",
            field: "Allergies",
            value: m?.medicalData?.allergies ?? "—",
            children: [],
          },
          {
            id: "medical-conditions",
            field: "Conditions",
            value: m?.medicalData?.conditions ?? "—",
            children: [],
          },
          {
            id: "medical-medications",
            field: "Medications",
            value: m?.medicalData?.medications ?? "—",
            children: [],
          },
        ],
      },
    ];
  }, [selectedLeader]);

  const renderExpandableRow = (item: NestedRow) => (
    <Table.Row id={item.id} textValue={item.field}>
      <Table.Cell textValue={item.field}>
        {({ hasChildItems, isDisabled, isExpanded, isTreeColumn }) => (
          <span className="flex items-center gap-1">
            {hasChildItems && isTreeColumn ? (
              <Button
                aria-label="Toggle row"
                isDisabled={isDisabled}
                isIconOnly
                size="sm"
                slot="chevron"
                variant="ghost"
              >
                <svg
                  aria-hidden
                  className={cn(
                    "size-4 transition-transform duration-150",
                    isExpanded ? "rotate-90" : "",
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            ) : null}
            <span>{item.field}</span>
          </span>
        )}
      </Table.Cell>
      <Table.Cell>{item.value}</Table.Cell>
      <Table.Collection items={item.children}>
        {renderExpandableRow}
      </Table.Collection>
    </Table.Row>
  );

  useEffect(() => {
    fetch("/api/protected/tripleaders")
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          redirect("/");
        }
        return response.json();
      })
      .then((data) => {
        setTripLeaders(data);
      });
  }, []);

  return (
    <div className="flex flex-col justify-top items-center w-full">
      <title>Trip Leader Dashboard - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Trip Leaders Dashboard
      </h1>
      <div className="flex flex-row justify-apart align-center mt-12 w-7/8">
        <TextField
          aria-label="Search trip leaders"
          onChange={setSearchTerm}
          className="w-full"
        >
          <Input placeholder="Search" />
        </TextField>
      </div>
      <div className="w-7/8 mt-4 overflow-x-auto">
        <Table>
          <Table.Content
            aria-label="Trip leaders"
            className="table-fixed min-w-[58rem] w-full"
            onRowAction={handleRowAction}
          >
            <Table.Header>
              <Table.Column isRowHeader className="w-44 whitespace-nowrap">
                Name
              </Table.Column>
              <Table.Column>Sports</Table.Column>
              <Table.Column className="w-56 whitespace-nowrap">
                Gmail
              </Table.Column>
              <Table.Column className="w-36 whitespace-nowrap">
                Shadowed trip?
              </Table.Column>
              <Table.Column className="w-28 whitespace-nowrap">
                Approved?
              </Table.Column>
              <Table.Column className="w-28 whitespace-nowrap">
                Certified?
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {(tripLeaders ?? [])
                .filter((tripLeader: TripLeaderDTO) => {
                  const name = tripLeader.member?.name;

                  if (!name) return false;

                  return (
                    searchTerm === "" ||
                    name.toLowerCase().includes(searchTerm) ||
                    tripLeader.sport?.some(s => s.toLowerCase().includes(searchTerm)) ||
                    tripLeader.gmail?.toLowerCase().includes(searchTerm)
                  );
                })
                .map((tripLeader: TripLeaderDTO) => (
                  <Table.Row
                    key={tripLeader.member?.name}
                    id={tripLeader.member?.name}
                    aria-label={`Trip leader: ${tripLeader.member?.name}`}
                  >
                    <Table.Cell>{tripLeader.member?.name}</Table.Cell>
                    <Table.Cell>{tripLeader.sport?.join(', ')}</Table.Cell>
                    <Table.Cell>{tripLeader.gmail}</Table.Cell>
                    <Table.Cell>
                      <span
                        role="img"
                        aria-label={tripLeader.process?.shadow ? "Yes" : "No"}
                      >
                        {tripLeader.process?.shadow ? "🟢" : "🛑"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        role="img"
                        aria-label={tripLeader.process?.approved ? "Yes" : "No"}
                      >
                        {tripLeader.process?.approved ? "🟢" : "🛑"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        role="img"
                        aria-label={
                          tripLeader.process?.certified ? "Yes" : "No"
                        }
                      >
                        {tripLeader.process?.certified ? "🟢" : "🛑"}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table.Content>
        </Table>
      </div>
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Backdrop isDismissable>
          <Modal.Container scroll="inside" size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{selectedLeader?.member?.name}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <span className="font-semibold text-default-600">
                      Sport
                    </span>
                    <span>{selectedLeader?.sport ?? "—"}</span>
                    <span className="font-semibold text-default-600">
                      Email
                    </span>
                    <span>{selectedLeader?.gmail ?? "—"}</span>
                    <span className="font-semibold text-default-600">
                      Pronouns
                    </span>
                    <span>{selectedLeader?.member?.pronouns ?? "—"}</span>
                    <span className="font-semibold text-default-600">
                      Phone
                    </span>
                    <span>{selectedLeader?.member?.phone ?? "—"}</span>
                  </div>
                  <Table>
                    <Table.ScrollContainer>
                      <Table.Content
                        aria-label="Trip leader details"
                        expandedKeys={expandedKeys}
                        onExpandedChange={setExpandedKeys}
                        treeColumn="field"
                      >
                        <Table.Header>
                          <Table.Column id="field" isRowHeader></Table.Column>
                          <Table.Column id="value"></Table.Column>
                        </Table.Header>
                        <Table.Body items={nestedData}>
                          {renderExpandableRow}
                        </Table.Body>
                      </Table.Content>
                    </Table.ScrollContainer>
                  </Table>
                  <CheckboxGroup
                    name="sports"
                    onChange={setSportValues}
                    value={sportValues}
                  >
                    <Label>Sports</Label>
                    {SPORTS.filter(s => !PSEUDO_SPORTS.includes(s)).map((sport) => (
                      <Checkbox key={sport} value={sport}>
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator>{() => null}</Checkbox.Indicator>
                          </Checkbox.Control>
                          {sport}
                        </Checkbox.Content>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                  <CheckboxGroup
                    name="certification-process"
                    onChange={setProcessValues}
                    value={processValues}
                  >
                    <Label>Certification Process</Label>
                    <Checkbox value="shadowed">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator>{() => null}</Checkbox.Indicator>
                        </Checkbox.Control>
                        Shadowed a trip
                      </Checkbox.Content>
                    </Checkbox>
                    <Checkbox value="approved">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator>{() => null}</Checkbox.Indicator>
                        </Checkbox.Control>
                        Approved by secretary of sports and head officer
                      </Checkbox.Content>
                    </Checkbox>
                    <Checkbox value="certified">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator>{() => null}</Checkbox.Indicator>
                        </Checkbox.Control>
                        Completed trip leader training
                      </Checkbox.Content>
                    </Checkbox>
                  </CheckboxGroup>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Modal.CloseTrigger />
                <Button
                  isDisabled={!isDirty}
                  onPress={() => {
                    handleSave();
                    setIsModalOpen(false);
                  }}
                >
                  Save
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
