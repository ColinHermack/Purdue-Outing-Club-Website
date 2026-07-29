"use server"

/**
 * An API endpoint accessible by officers to get a list of basic information about every club member.
 * 
 * @author Colin Hermack
 */

import BasicMemberDTO from "@/dtos/basicMemberDto";
import MemberDTO from "@/dtos/memberDto";
import { getMemberByEmail, getMembers } from "@/miniservices/memberMiniService";
import { verifyMemberIsOfficer } from "@/miniservices/officerMiniService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";


/**
 * A GET endpoint that returns a response with a list of basic information about every club member.
 * 
 * @returns An HTTP response object
 */
export async function GET(): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);
        
        if (
            !session ||
            session.user === undefined ||
            typeof session.user.email !== "string"
        ) {
            return new Response("Unauthorized", { status: 403 });
        }

        const requestingMember: MemberDTO | null = await getMemberByEmail(session.user.email);
        if (requestingMember == null || requestingMember.id == undefined) {
            return new Response(`No member with email ${session.user.email} exists.`, { status: 401 });
        }

        

        const requestingMemberIsOfficer: boolean = await verifyMemberIsOfficer(requestingMember.id);
        if (!requestingMemberIsOfficer) {
            return new Response("You must be an officer to view this resource.", { status: 401 });
        }

        const members: MemberDTO[] = await getMembers();

        const basicMembers: BasicMemberDTO[] = members.map(member => {
            return {
                id: member.id,
                name: member.name,
                emai: member.email
            }
        })

        return new Response(JSON.stringify(basicMembers), { status: 200 });
    } catch (error: unknown) {
        return new Response("Internal Server Error", { status: 500 });
    }
}