"use client";

/**
 * React component which calls the leaderboard API and displays the results in a table.
 *
 * @author Colin Hermack
 */

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";

type LeaderboardItemT = {
  key: number;
  name: string;
  num_trips: number;
};

const columns = [
  {
    key: "name",
    label: "Clubber",
  },
  {
    key: "num_trips",
    label: "Number of Trips",
  },
];

/**
 * A React component which displays the overall and led leaderboards.
 *
 * This component fetches the leaderboard data from the API and displays it in two tables.
 *
 * The first table shows the overall leaderboard, with the number of trips that each member has been on.
 *
 * The second table shows the led leaderboard, with the number of trips that each member has led.
 *
 * @returns A JSX element representing the leaderboard.
 */
export default function Leaderboard(): JSX.Element {
  const [overallLeaderboard, setOverallLeaderboard] = useState<
    LeaderboardItemT[]
  >([]);
  const [ledLeaderboard, setLedLeaderboard] = useState<LeaderboardItemT[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard/total")
      .then((response) => response.json())
      .then((data) => {
        let processedData: LeaderboardItemT[] = data.map(
          (item: any, index: number) => {
            return {
              key: index,
              name: item.name,
              num_trips: item.count,
            };
          },
        );

        setOverallLeaderboard(processedData);
      });
  }, []);

  useEffect(() => {
    fetch("/api/leaderboard/led")
      .then((response) => response.json())
      .then((data) => {
        let processedData: LeaderboardItemT[] = data.map(
          (item: any, index: number) => {
            return {
              key: index,
              name: item.name,
              num_trips: item.count,
            };
          },
        );

        setLedLeaderboard(processedData);
      });
  }, []);

  if (overallLeaderboard.length === 0 || ledLeaderboard.length === 0) {
    return <Spinner color={"default"} />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold mb-4">Overall</h3>
      <Table
        aria-label="Example table with dynamic content"
        className="max-w-[600px]"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={overallLeaderboard}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <h3 className="text-2xl font-bold my-4">Trips Led</h3>
      <Table
        aria-label="Example table with dynamic content"
        className="max-w-[600px]"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={ledLeaderboard}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
