/*
 * The only purpose of this page is to redirect to the constitution PDF.
 *
 * @author Colin Hermack
 */

import { redirect } from "next/navigation";

export default function ConstitutionPage() {
  redirect("/docs/poc_constitution.pdf");
}
