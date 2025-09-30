import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validatePassword, validateEducationalBackground } from '@/lib/validators';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { firstName, lastName, dateOfBirth, educationalBackground, email, password } = body;

    // Validate all fields
    const firstNameValidation = validateFirstName(firstName);
    if (!firstNameValidation.isValid) {
      return NextResponse.json(
        { message: firstNameValidation.message },
        { status: 400 }
      );
    }

    const lastNameValidation = validateLastName(lastName);
    if (!lastNameValidation.isValid) {
      return NextResponse.json(
        { message: lastNameValidation.message },
        { status: 400 }
      );
    }

    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.isValid) {
      return NextResponse.json(
        { message: dobValidation.message },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { message: emailValidation.message },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    const backgroundValidation = validateEducationalBackground(educationalBackground);
    if (!backgroundValidation.isValid) {
      return NextResponse.json(
        { message: backgroundValidation.message },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking email:', checkError);
      return NextResponse.json(
        { message: 'Error checking email uniqueness' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Convert date of birth to proper format for database
    const formattedDob = dayjs(dateOfBirth, 'DD/MM/YY').format('YYYY-MM-DD');

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user data into users table directly (let database auto-generate ID)
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        firstname: firstName,
        lastname: lastName,
        "date of birth": formattedDob,
        "educational background": educationalBackground,
        password: hashedPassword,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { 
          message: 'Error creating user profile',
          error: insertError.message,
          details: insertError
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Registration successful!',
        user: {
          id: insertData.id,
          email: insertData.email,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
