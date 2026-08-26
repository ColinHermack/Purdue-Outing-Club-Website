"use client";

/**
 * A directory of club members, accessible to trip leaders. Shows the contact, dues, agreement,
 * first aid, driver and vehicle data needed when planning a trip, with search and an
 * active-members-only filter.
 *
 * @author Colin Hermack
 */

import {
  Checkbox,
  Input,
  Pagination,
  Spinner,
  Table,
  TextField,
} from "@heroui/react";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MemberDirectoryEntryDTO, {
  DuesStatus,
} from "@/dtos/memberDirectoryEntryDto";

const PAGE_SIZE = 50;

const DUES_LABELS: Record<DuesStatus, string> = {
  paid: "Paid",
  expired: "Expired",
  none: "No dues data",
};

/**
 * Builds the list of page numbers to render, collapsing long runs into ellipses so the control
 * stays a fixed width no matter how many members are in the directory.
 *
 * @param page The currently selected page.
 * @param pageCount The total number of pages.
 * @returns Page numbers to render, with null marking a gap.
 */
function buildPageItems(page: number, pageCount: number): (number | null)[] {
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const visible = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  return visible.flatMap((p, index) =>
    index > 0 && p - visible[index - 1] > 1 ? [null, p] : [p],
  );
}

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<MemberDirectoryEntryDTO[] | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetch("/api/protected/memberdirectory")
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          redirect("/");
        }

        return response.json();
      })
      .then((data) => {
        setMembers(data);
      });
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return (members ?? []).filter((member: MemberDirectoryEntryDTO) => {
      if (activeOnly && !member.isActive) return false;

      return (
        query === "" ||
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
    });
  }, [members, searchTerm, activeOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(firstIndex, firstIndex + PAGE_SIZE);

  // Narrowing the list can leave the current page past the end of the results, which would render
  // an empty table, so go back to the first page whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeOnly]);

  return (
    <div className="flex flex-col justify-top items-center w-full">
      <title>Member Directory - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Member Directory
      </h1>
      <div className="flex flex-row justify-apart align-center mt-12 w-7/8 gap-4">
        <TextField
          aria-label="Search members"
          className="w-full"
          onChange={setSearchTerm}
        >
          <Input placeholder="Search by name or email" />
        </TextField>
        <Checkbox
          aria-label="Show active members only"
          isSelected={activeOnly}
          onChange={setActiveOnly}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator>{() => null}</Checkbox.Indicator>
            </Checkbox.Control>
            <span className="whitespace-nowrap">Active only</span>
          </Checkbox.Content>
        </Checkbox>
      </div>
      {members === null ? (
        <Spinner aria-label="Loading members" className="my-12" />
      ) : (
        <div className="w-7/8 mt-4">
          <Table>
            <Table.ScrollContainer data-scrollbar="thin">
              <Table.Content
                aria-label="Club members"
                className="table-fixed min-w-[92rem] w-full"
              >
                <Table.Header>
                  <Table.Column isRowHeader className="w-48 whitespace-nowrap">
                    Name
                  </Table.Column>
                  <Table.Column className="w-32 whitespace-nowrap">
                    Pronouns
                  </Table.Column>
                  <Table.Column className="w-56 whitespace-nowrap">
                    Email
                  </Table.Column>
                  <Table.Column className="w-36 whitespace-nowrap">
                    Phone
                  </Table.Column>
                  <Table.Column className="w-32 whitespace-nowrap">
                    Dues
                  </Table.Column>
                  <Table.Column className="w-24 whitespace-nowrap">
                    Policy?
                  </Table.Column>
                  <Table.Column className="w-24 whitespace-nowrap">
                    Waiver?
                  </Table.Column>
                  <Table.Column className="w-36 whitespace-nowrap">
                    First Aid
                  </Table.Column>
                  <Table.Column className="w-28 whitespace-nowrap">
                    Car Seats
                  </Table.Column>
                  <Table.Column className="w-24 whitespace-nowrap">
                    Hitch?
                  </Table.Column>
                  <Table.Column className="w-24 whitespace-nowrap">
                    Driver?
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {visible.map((member: MemberDirectoryEntryDTO) => (
                    <Table.Row
                      key={member.id}
                      aria-label={`Member: ${member.name}`}
                      id={member.id}
                    >
                      <Table.Cell>{member.name}</Table.Cell>
                      <Table.Cell>{member.pronouns ?? "—"}</Table.Cell>
                      <Table.Cell>{member.email}</Table.Cell>
                      <Table.Cell>{member.phone ?? "—"}</Table.Cell>
                      <Table.Cell>
                        {member.duesStatus
                          ? DUES_LABELS[member.duesStatus]
                          : DUES_LABELS.none}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          aria-label={member.policyAgreement ? "Yes" : "No"}
                          role="img"
                        >
                          {member.policyAgreement ? "🟢" : "🛑"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          aria-label={member.waiverAgreement ? "Yes" : "No"}
                          role="img"
                        >
                          {member.waiverAgreement ? "🟢" : "🛑"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{member.firstAidType ?? "None"}</Table.Cell>
                      <Table.Cell>{member.carCapacity ?? "—"}</Table.Cell>
                      <Table.Cell>
                        <span
                          aria-label={member.carHitch ? "Yes" : "No"}
                          role="img"
                        >
                          {member.carHitch ? "🟢" : "🛑"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          aria-label={member.driverCertified ? "Yes" : "No"}
                          role="img"
                        >
                          {member.driverCertified ? "🟢" : "🛑"}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      )}
      {members !== null && pageCount > 1 && (
        <Pagination
          aria-label="Member directory pages"
          className="my-8 w-7/8 justify-center"
        >
          <Pagination.Summary>
            {`Showing ${firstIndex + 1}–${firstIndex + visible.length} of ${filtered.length}`}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={currentPage === 1}
                onPress={() => setPage(currentPage - 1)}
              >
                <Pagination.PreviousIcon />
                Previous
              </Pagination.Previous>
            </Pagination.Item>
            {buildPageItems(currentPage, pageCount).map((item, index) =>
              item === null ? (
                <Pagination.Item key={`gap-${index}`}>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              ) : (
                <Pagination.Item key={item}>
                  <Pagination.Link
                    aria-label={`Page ${item}`}
                    isActive={item === currentPage}
                    onPress={() => setPage(item)}
                  >
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={currentPage === pageCount}
                onPress={() => setPage(currentPage + 1)}
              >
                Next
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}
