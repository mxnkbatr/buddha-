import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { clerkClient } from "@clerk/nextjs/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;

    const { db } = await connectToDatabase();

    // 1. Build a robust query
    // We check if 'id' matches the MongoDB _id OR the clerkId
    let query: any = {
      $or: [
        { clerkId: id },           // Match Clerk ID
        { _id: id }                // Match String _id
      ]
    };

    // Only attempt to convert to ObjectId if the string is valid 24-char hex
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // 2. IMPORTANT: Search in the "users" collection (not "monks")
    // We also enforce that the role must be "monk"
    const monk = await db.collection("users").findOne({
      $and: [
        query,
        { role: "monk" } 
      ]
    });

    if (!monk) {
      const mockMonks: any = {
        buyantsog: {
          _id: "buyantsog",
          id: "buyantsog",
          name: { mn: "Буянцог", en: "Buyantsog" },
          title: { mn: "Зөн билэгтэн", en: "Psychic" },
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
          specialties: ["Засал", "Зөн билэг"],
          yearsOfExperience: 15,
          isAvailable: true,
          bio: { mn: "Олон жилийн туршлагатай засалч.", en: "Experienced healer." },
          quote: { mn: "Дотоод хүчээ мэдэр.", en: "Feel your inner strength." },
          services: [{ id: "1", name: { mn: "Засал", en: "Healing" }, price: 88800, duration: "1 hour" }]
        },
        undraa: {
          _id: "undraa",
          id: "undraa",
          name: { mn: "Ундраа", en: "Undraa" },
          title: { mn: "Тарог зөн", en: "Tarot Reader" },
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
          yearsOfExperience: 12,
          isAvailable: true,
          bio: { mn: "12 жил таро уншсан туршлагатай.", en: "12 years of Tarot reading experience." },
          services: [{ id: "2", name: { mn: "Таро үзлэг", en: "Tarot Reading" }, price: 50000, duration: "45 min" }]
        },
        amina: {
          _id: "amina",
          id: "amina",
          name: { mn: "Амина", en: "Amina" },
          title: { mn: "Зурхайч", en: "Astrologer" },
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
          yearsOfExperience: 8,
          isAvailable: false,
          bio: { mn: "Төөрөг зурхай тайлагч.", en: "Astrology chart reader." }
        },
        dorjbaatar: {
          _id: "dorjbaatar",
          id: "dorjbaatar",
          name: { mn: "Доржбаатар", en: "Dorjbaatar" },
          title: { mn: "Бөө", en: "Shaman" },
          image: "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=200&q=80",
          yearsOfExperience: 10,
          isAvailable: true,
          bio: { mn: "Онгод тэнгэртэй холбогдогч.", en: "Shamanic healer connected to spirits." },
          services: [{ id: "3", name: { mn: "Засал", en: "Ritual Healing" }, price: 60000, duration: "1.5 hours" }]
        },
        banchinerdene: {
          _id: "banchinerdene",
          id: "banchinerdene",
          name: { mn: "Банчинэрдэнэ", en: "Banchinerdene" },
          title: { mn: "Бясалгалын багш", en: "Meditation Teacher" },
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
          yearsOfExperience: 20,
          isAvailable: true,
          bio: { mn: "Бясалгал, йогийн багш.", en: "Meditation and yoga guide." },
          services: [{ id: "4", name: { mn: "Бясалгал", en: "Meditation" }, price: 55000, duration: "1 hour" }]
        },
        tsetseg: {
          _id: "tsetseg",
          id: "tsetseg",
          name: { mn: "Цэцэг", en: "Tsetseg" },
          title: { mn: "Энергийн засалч", en: "Energy Healer" },
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
          yearsOfExperience: 7,
          isAvailable: false,
          bio: { mn: "Энерги тэнцвэржүүлэгч.", en: "Energy balancing professional." }
        }
      };

      if (mockMonks[id]) {
        return NextResponse.json(mockMonks[id]);
      }

      return NextResponse.json(
        { message: "Monk profile not found" },
        { status: 404 }
      );
    }

    // 3. Serialize _id to string before returning
    const serializedMonk = {
      ...monk,
      _id: monk._id.toString()
    };

    return NextResponse.json(serializedMonk);

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const { db } = await connectToDatabase();

    // 1. Build a robust query to find the user
    let query: any = {
      $or: [
        { clerkId: id },
        { _id: id }
      ]
    };
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // 2. Fetch current user to check for role changes/demotion
    const currentUserDoc = await db.collection("users").findOne(query);
    if (!currentUserDoc) {
      return NextResponse.json({ message: "Monk profile not found" }, { status: 404 });
    }

    // Prevent updating immutable fields
    const { _id, clerkId, ...updateFields } = body;

    const isDemotingFromMonk = updateFields.role && updateFields.role !== 'monk' && currentUserDoc.role === 'monk';

    // 3. Update Database
    const result = await db.collection("users").findOneAndUpdate(
      { _id: currentUserDoc._id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }

    const updatedUser = result;

    // 4. Handle Monk profile collection cleanup if demoted
    if (isDemotingFromMonk) {
      await db.collection("monks").deleteOne({ userId: updatedUser._id });
    }

    // 5. Sync to Clerk Metadata
    if (updatedUser.clerkId && updatedUser.clerkId.startsWith("user_")) {
      try {
        const client = await clerkClient();
        await client.users.updateUser(updatedUser.clerkId, {
          publicMetadata: {
            role: updatedUser.role,
            monkStatus: updatedUser.monkStatus,
          },
          unsafeMetadata: {
            phone: updatedUser.phone,
            title: updatedUser.title,
            name: updatedUser.name
          }
        });

        // Add Phone Number as Login Identifier (Auto-Verified)
        if (updatedUser.phone) {
          try {
            await client.phoneNumbers.createPhoneNumber({
              userId: updatedUser.clerkId,
              phoneNumber: updatedUser.phone,
              verified: true
            });
          } catch (e) {
            console.log("Note: Could not add phone number to Clerk:", e);
          }
        }
      } catch (clerkErr) {
        console.error("Clerk Sync Error:", clerkErr);
      }
    }

    return NextResponse.json({ message: "Profile updated", success: true });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message, success: false },
      { status: 500 }
    );
  }
}