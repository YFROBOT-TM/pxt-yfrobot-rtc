/** 
 * @file YFRTCPCF
 * @brief YFROBOT's RTC Real-time Module makecode Package.
 * @n This is a MakeCode graphics programming extension for YFROBOT's RTC Real-time Module(pcf8563).
 * 
 * @copyright    YFROBOT,2021
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2021-12-04
*/

//% color="#45b787" weight=7 icon="\uf12e"
namespace YFRTCPCF {
    
    let PCF8563_ADDRESS = 0x51       ///< I2C address for PCF8563
    let PCF8563_CLKOUTCONTROL = 0x0D ///< CLKOUT control register
    let PCF8563_CONTROL_1 = 0x00     ///< Control and status register 1
    let PCF8563_CONTROL_2 = 0x01     ///< Control and status register 2
    let PCF8563_VL_SECONDS = 0x02    ///< register address for VL_SECONDS
    let PCF8563_CLKOUT_MASK = 0x83   ///< bitmask for SqwPinMode on CLKOUT pin

    let PCF8563_REG_SECOND = 2          ///< register address for SECOND
    let PCF8563_REG_MINUTE = 3          ///< register address for MINUTE
    let PCF8563_REG_HOUR = 4            ///< register address for HOUR
    let PCF8563_REG_DAY = 5             ///< register address for DAY
    let PCF8563_REG_WEEKDAY = 6         ///< register address for WEEKDAY
    let PCF8563_REG_MONTH = 7           ///< register address for MONTH
    let PCF8563_REG_YEAR = 8            ///< register address for YEAR

    export enum DataUnit {
        //% block="Year"
        Year,
        //% block="Month"
        Month,
        //% block="Day"
        Day,
        //% block="Weekday"
        Weekday,
        //% block="Hour"
        Hour,
        //% block="Minute"
        Minute,
        //% block="Second"
        Second
    }

    /**
     * @brief  Convert a binary value to BCD format for the RTC registers
     * @param val Binary value
     * @return BCD value
    */
    function bin2bcd(val: number): number {
        return val + 6 * (val / 10);
    }

    function rtc_setReg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(PCF8563_ADDRESS, buf);
    }

    function rtc_getReg(reg: number): number {
        pins.i2cWriteNumber(PCF8563_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(PCF8563_ADDRESS, NumberFormat.UInt8BE);
    }

    function HexToDec(dat: number): number {
        return (dat >> 4) * 10 + (dat % 16);
    }

    function DecToHex(dat: number): number {
        return Math.idiv(dat, 10) * 16 + (dat % 10)
    }

    export function start() {
        let t = getSecond()
        setSecond(t & 0x7f)
    }

    export function setSecond(dat: number): void {
        rtc_setReg(PCF8563_REG_SECOND, DecToHex(dat % 60))
    }

    export function getSecond(): number {
        return Math.min(HexToDec(rtc_getReg(PCF8563_REG_SECOND)), 59)
    }

    /**
     * set the data or time of the rtc module.
     * @param data the data/time , eg: DataUnit.Year
     * @param num Current data/time , eg: 0
     */
    //% blockId="YFRTCPCF_set_data"  weight=100 blockGap=15
    //% block="RTC set %data | %num"
    //% data.fieldEditor="gridpicker" data.fieldOptions.columns=3
    //% inlineInputMode=inline
    export function setData(data: DataUnit, num: number): void {
        switch (data) {
            case DataUnit.Year:
                rtc_setReg(PCF8563_REG_YEAR, DecToHex(num % 100));
                break;
            case DataUnit.Month:
                rtc_setReg(PCF8563_REG_MONTH, DecToHex(num % 13));
                break;
            case DataUnit.Day:
                rtc_setReg(PCF8563_REG_DAY, DecToHex(num % 32));
                break;
            case DataUnit.Weekday:
                rtc_setReg(PCF8563_REG_WEEKDAY, DecToHex(num % 7))
                break;
            case DataUnit.Hour:
                rtc_setReg(PCF8563_REG_HOUR, DecToHex(num % 24));
                break;
            case DataUnit.Minute:
                rtc_setReg(PCF8563_REG_MINUTE, DecToHex(num % 60));
                break;
            case DataUnit.Second:
                rtc_setReg(PCF8563_REG_SECOND, DecToHex(num % 60))
                break;
            default:
                break;
        }
        start();
    }

    /**
     * get the date or time of the rtc module.
     * @param data the date/time , eg: DataUnit.Year
     */
    //% blockID="YFRTCPCF_get_data" weight=90 blockGap=15
    //% block="RTC get %data"
    //% data.fieldEditor="gridpicker" data.fieldOptions.columns=3
    //% inlineInputMode=inline
    export function readData(data: DataUnit): number {
        switch (data) {
            case DataUnit.Year:
                return Math.min(HexToDec(rtc_getReg(PCF8563_REG_YEAR)), 99) + 2000
                break;
            case DataUnit.Month:
                return Math.max(Math.min(HexToDec(rtc_getReg(PCF8563_REG_MONTH) & 0x1f), 12), 1)
                break;
            case DataUnit.Day:
                return Math.max(Math.min(HexToDec(rtc_getReg(PCF8563_REG_DAY) & 0x3f), 31), 1)
                break;
            case DataUnit.Weekday:
                return Math.max(Math.min(HexToDec(rtc_getReg(PCF8563_REG_WEEKDAY) & 0x07), 6), 0)
                break;
            case DataUnit.Hour:
                return Math.min(HexToDec(rtc_getReg(PCF8563_REG_HOUR) & 0x3f), 23)
                break;
            case DataUnit.Minute:
                return Math.min(HexToDec(rtc_getReg(PCF8563_REG_MINUTE) & 0x7f), 59)
                break;
            case DataUnit.Second:
                return Math.min(HexToDec(rtc_getReg(PCF8563_REG_SECOND) & 0x7f), 59)
                break;
            default:
                return 0
        }
    }

    /**
     * get the raw value of the date or time in the rtc module.
     * @param data the raw value date/time , eg: DataUnit.Year
     */
    //% advanced=true
    //% blockID="YFRTCPCF_get_data_real" weight=85 blockGap=15
    //% block="RTC get raw value of %data"
    //% data.fieldEditor="gridpicker" data.fieldOptions.columns=3
    //% inlineInputMode=inline
    export function readDataReal(data: DataUnit): number {
        switch (data) {
            case DataUnit.Year:
                return rtc_getReg(PCF8563_REG_YEAR)
                break;
            case DataUnit.Month:
                return rtc_getReg(PCF8563_REG_MONTH)
                break;
            case DataUnit.Day:
                return rtc_getReg(PCF8563_REG_DAY)
                break;
            case DataUnit.Weekday:
                return rtc_getReg(PCF8563_REG_WEEKDAY)
                break;
            case DataUnit.Hour:
                return rtc_getReg(PCF8563_REG_HOUR)
                break;
            case DataUnit.Minute:
                return rtc_getReg(PCF8563_REG_MINUTE)
                break;
            case DataUnit.Second:
                return rtc_getReg(PCF8563_REG_SECOND)
                break;
            default:
                return 0
        }
    }
}
