"use client";

import { useFormState, useFormStatus } from "react-dom"; // แก้ userFormStae เป็น useFormState ด้วยนะครับ
import { addPromoCode, type FormState } from "./action";
import { useState } from "react";

type Course = {
    id: number;
    title: string;
};

function submitButton(){
    const { pending } = useFormStatus();
    return(
        <button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Promo Code"}
        </button>
    );
}

export default function AddCouponForm( {courses }: AddCouponFormProps) {

    const initialState: FormState = { message: "" };
    const [state, dispatch] = useFormState(addPromoCode, initialState);
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("percent");

    return(

        <form action={dispatch}>

            <div>
                <label htmlFor="code">Promo Code</label>
                <input type="text" 
                name="code" 
                id="code" 
                required />
                {state.errors?.code && ( <p style={{ color: "red" }}> 
                {state.errors.code[0]} </p>)}
            </div>

            <div>
                <label htmlFor="min_purchase_amount">Minimum Purchase Amount (THB)*</label>
                <input type="number"
                id="min_purchase_amount"
                name="min_purchase_amount"
                defaultValue={0}
                min="0"
                required />
                {state.errors?.min_purchase_amount && ( <p style={{ color: "red" }}> 
                {state.errors.min_purchase_amount[0]} </p>)}
            </div>

             {/* --- Discount Type --- */}

            <div>

                <label>Select discount type</label>

                <div>
                    <input type="radio" 
                    id="fixed"
                    name="discount_type"
                    value="fixed"
                    checked={discountType === "fixed"}
                    onChange={() => setDiscountType("fixed")}
                    />
                    <label htmlFor="fixed">Fixed Amount (THB)*</label>

                    <input type="number" 
                    name="fixed_amount"
                    min="0"
                    disabled={ discountType !== "fixed" }
                    style={ {marginLeft: "8px"}}
                    />
                </div>

                <div>
                <input
                    type="radio"
                    id="percent"
                    name="discount_type"
                    value="percent"
                    checked={discountType === "percent"}
                    onChange={() => setDiscountType("percent")}
                />
                <label htmlFor="percent">Percent (%)</label>
                <input      
                    type="number"
                    name="percent_amount"
                    min="0"
                    max="100"
                    disabled={discountType !== "percent"}
                    style={{ marginLeft: '8px' }}
                />
                </div>

                {state.errors?.discount_value && (
                <p style={{ color: "red" }}>
                    {state.errors.discount_value[0]} </p>)}  

            </div>

            <div>
                <label htmlFor="course_ids">Courses Included</label>

                <select name="course_ids" 
                id="course_ids" 
                defaultValue="all" 
                multiple={false}>
                
                <option value="all">All Courses</option>
                { courses.map( (course) => (
                    <option key={course.id} value={course.id}>
                        {course.title}
                    </option>
                ))}
                </select>

                {state.errors?.course_ids && (
                <p style={{ color: "red" }}>
                {state.errors.course_ids[0]}
                </p> )}

            </div>
            
            <div>
                <button type="button">Cancel</button>
                 {/* <SubmitButton /> */}
                </div>
            
        </form>
    ); 
}