import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData()
        const room = data.get('room')?.toString().trim()

        if (!room || room == "") return fail(400, { error: "Pole nie może być puste" })

        redirect(300, "/play/" + room)
    }
};