/**
 * Utility functions สำหรับคำนวณ lesson progress
 * แยก logic ที่ซับซ้อนออกมาเพื่อให้อ่านง่ายขึ้น
 */

// ====== ฟังก์ชันคำนวณ Threshold สำหรับการจบบทเรียน ======

/**
 * คำนวณว่าต้องดูวิดีโอกี่วินาทีถึงจะถือว่าจบ
 * วิดีโอสั้นใช้เกณฑ์ผ่อนปรน วิดีโอยาวใช้เกณฑ์เข้มงวดขึ้น
 */
export function calculateWatchTimeThreshold(
    videoDuration: number,
    currentWatchedTime: number
): number {
    // วิดีโอสั้นมาก (≤30 วินาที) - ผ่อนปรนมาก
    if (videoDuration <= 30) {
        return Math.max(videoDuration * 0.2, 5); // ดูอย่างน้อย 20% หรือ 5 วินาที
    }

    // วิดีโอสั้น (30 วินาที - 2 นาที)
    if (videoDuration <= 120) {
        // ถ้าดูไปแล้วเยอะ (≥60%) = ผ่อนปรน (อาจจะดูเร็ว x2)
        if (currentWatchedTime >= videoDuration * 0.6) {
            return videoDuration * 0.25; // ดูอย่างน้อย 25%
        }
        // ถ้าดูไปยังน้อย = เข้มงวดขึ้น (กันการ skip)
        return videoDuration * 0.4; // ดูอย่างน้อย 40%
    }

    // วิดีโอกลาง (2-10 นาที)
    if (videoDuration <= 600) {
        if (currentWatchedTime >= videoDuration * 0.5) {
            return videoDuration * 0.3; // ดูอย่างน้อย 30%
        }
        return videoDuration * 0.45; // ดูอย่างน้อย 45%
    }

    // วิดีโอยาว (>10 นาที) - เข้มงวดสุด
    if (currentWatchedTime >= videoDuration * 0.4) {
        return videoDuration * 0.35; // ดูอย่างน้อย 35%
    }
    return videoDuration * 0.5; // ดูอย่างน้อย 50%
}

/**
 * คำนวณว่าต้อง seek ไปถึงตำแหน่งไหนถึงจะถือว่าเกือบจบ
 * ตอบ: ≥90% ของความยาววิดีโอ หรือ เหลืออีก 5 วินาทีก็จบ
 */
export function calculatePositionThreshold(videoDuration: number): number {
    return Math.max(videoDuration * 0.9, videoDuration - 5);
}

// ====== ฟังก์ชันตรวจสอบสถานะ ======

/**
 * ตรวจสอบว่าบทเรียนนี้จบแล้วหรือยัง
 * เกณฑ์: ต้อง seek ใกล้ท้าย + ดูจริงครบตาม threshold
 */
export function isLessonCompleted(
    currentPosition: number,
    watchedTime: number,
    videoDuration: number
): boolean {
    if (!videoDuration || videoDuration <= 0) {
        return false;
    }

    const positionThreshold = calculatePositionThreshold(videoDuration);
    const watchTimeThreshold = calculateWatchTimeThreshold(videoDuration, watchedTime);

    const reachedEnd = currentPosition >= positionThreshold;
    const watchedEnough = watchedTime >= watchTimeThreshold;

    return reachedEnd && watchedEnough;
}

/**
 * คำนวณ progress percentage ที่แม่นยำ
 * ใช้ทั้งตำแหน่งที่ seek ไปและเวลาที่ดูจริง
 * เพื่อป้องกันการ skip ไปจบแล้วแสดง 100%
 */
export function calculateProgressPercent(
    currentPosition: number,
    watchedTime: number,
    videoDuration: number
): number {
    if (!videoDuration || videoDuration <= 0) {
        return 0;
    }

    // คำนวณ % จากตำแหน่งที่ seek ไป
    const positionPercent = currentPosition / videoDuration;

    // คำนวณ % จากเวลาที่ดูจริง (คูณ 1.5 เพราะคนอาจจะดูเร็ว x2)
    const watchedPercent = watchedTime / videoDuration;

    // เอาค่าที่น้อยกว่า = ถ้า skip มากจะได้ % ต่ำกว่า
    const percent = Math.min(positionPercent, watchedPercent * 1.5);

    // จำกัดให้อยู่ในช่วง 0-100%
    return Math.min(100, Math.max(0, percent * 100));
}

// ====== ฟังก์ชันคำนวณตำแหน่ง Resume ======

/**
 * คำนวณว่าควร resume จากตำแหน่งไหน
 * ถ้า user skip ไปจบแต่ดูจริงยังไม่พอ จะ adjust ให้ resume จากตำแหน่งที่เหมาะสม
 */
export function calculateResumePosition(
    lastPosition: number,
    watchedTime: number,
    videoDuration: number,
    isCompleted: boolean
): number {
    // ถ้าจบแล้ว ให้ resume จากจุดที่บันทึกไว้ตามปกติ
    if (isCompleted) {
        return lastPosition;
    }

    // ถ้ายังไม่จบ ตรวจสอบว่าตำแหน่งสมเหตุสมผลหรือไม่
    const positionThreshold = calculatePositionThreshold(videoDuration);
    const isNearEnd = lastPosition >= positionThreshold;
    const hasLowWatchTime = watchedTime < videoDuration * 0.3;

    // ถ้าตำแหน่งอยู่ใกล้ท้ายแต่ดูจริงยังน้อย = น่าจะ skip
    // ให้ resume จากตำแหน่งที่สมเหตุสมผลแทน
    if (isNearEnd && hasLowWatchTime) {
        // ประมาณ 2x ของเวลาที่ดูจริง แต่ไม่เกิน 90%
        const adjustedPosition = Math.min(watchedTime * 2, videoDuration * 0.9);
        console.log(
            `Adjusted resume: ${lastPosition}s → ${adjustedPosition}s (watched: ${watchedTime}s)`
        );
        return adjustedPosition;
    }

    return lastPosition;
}

// ====== ฟังก์ชันป้องกัน watch time ผิดปกติ ======

/**
 * จำกัด watch time ไม่ให้สูงเกินไป
 * ป้องกันข้อมูลผิดพลาดและ integer overflow
 */
export function capWatchTime(
    existingWatchTime: number,
    videoDuration: number | null
): number {
    // กำหนดค่าสูงสุดตามความยาววิดีโอ
    const maxAllowed = videoDuration ? videoDuration * 5 : 1800; // 5x หรือ 30 นาที

    return Math.min(existingWatchTime, maxAllowed);
}

// ====== ฟังก์ชันแสดงสถานะเป็น string ======

/**
 * แปลงสถานะเป็น string เพื่อความชัดเจน
 */
export type LessonStatus = "completed" | "in_progress" | "not_started";

export function getLessonStatus(
    hasProgress: boolean,
    isCompleted: boolean,
    watchedTime: number
): LessonStatus {
    if (isCompleted) {
        return "completed";
    }

    if (hasProgress && watchedTime > 0) {
        return "in_progress";
    }

    return "not_started";
}

