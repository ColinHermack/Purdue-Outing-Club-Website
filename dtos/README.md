# `dtos/`

Data Transfer Objects: the camelCase shapes that miniservices return and API routes send to the browser. They are
plain classes with optional fields and no methods. A DTO may contain another DTO.

| File | Class | Used for |
| --- | --- | --- |
| `memberDto.ts` | `MemberDTO` | A full member record (signed-in user, export). Contains sensitive fields; never send it from a public route. |
| `basicMemberDto.ts` | `BasicMemberDTO` | Id, name, email only (`/api/protected/members`). |
| `memberDirectoryEntryDto.ts` | `MemberDirectoryEntryDTO`, `DuesStatus` | One row of the member directory with derived status fields. |
| `officerDto.ts` | `OfficerDTO` | An officer position joined with the member's contact info. |
| `tripDto.ts` | `TripDTO` | A trip. |
| `tripLeaderDto.ts` | `TripLeaderDTO` | A trip leader with an embedded `MemberDTO`. |
| `createTripLeaderDto.ts` | `CreateTripLeaderDTO` | Request body for `POST /api/protected/tripleaders`. |
| `updateTripLeaderDto.ts` | `UpdateTripLeaderDTO` | Request body for `PUT /api/protected/tripleaders`. |
| `newsPreviewDto.ts` | `NewsPreviewDTO` | Title, date, summary, slug of a news post. |

When you change a DTO that an API route returns, update the matching schema in `public/openapi.json`.

Compare with [models/](../models/README.md), which describe database rows.
