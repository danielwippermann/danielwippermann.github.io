/*! resol-vbus | Copyright (c) 2016-present, Daniel Wippermann | MIT license */

const fs = require('fs');
const path = require('path');


const {
    SpecificationFile,
} = require('./resol-vbus');


const {
    expect,
    expectOwnPropertyNamesToEqual,
    itShouldBeAClass,
    expectTypeToBe,
} = require('./test-utils');




const testVsf1Filename = path.resolve(__dirname, '../fixtures/vbus-specifications/test.vsf');
const testVsf1 = fs.readFileSync(testVsf1Filename);



describe('SpecificationFile', () => {

    itShouldBeAClass(SpecificationFile, null, {
        constructor: Function,
        getSpecificationData: Function,
        _generateSpecificationData: Function,
        _parseBuffer: Function,
        getRawValue: Function,
        setRawValue: Function,
    }, {
        getDefaultSpecificationFile: Function,
        loadFromFile: Function,
    });

    describe('#constructor', () => {

        it('should work correctly for fixtures file #1', () => {
            const specFile = new SpecificationFile(testVsf1);

            expectOwnPropertyNamesToEqual(specFile, [
                'buffer',
                'types',
                'typeById',
                'typeByCode',
                'unitFamilies',
                'unitFamilyById',
                'unitFamilyByCode',
                'knownUnits',
                'knownUnitsById',
                'knownUnitsByCode',

                'dataVersion',
                'datecode',
                'texts',
                'localizedTexts',
                'units',
                'unitById',
                'unitByCode',
                'deviceTemplates',
                'packetTemplates',

                'specificationData',
            ]);

            expect(specFile.buffer).toBe(testVsf1);

            expect(specFile.dataVersion).toBe(1);
            expect(specFile.datecode).toBe(20161007);

            expectTypeToBe(specFile.unitFamilyByCode, 'object');

            const { unitFamilyByCode } = specFile;

            expect(specFile.texts).toEqual([
                '',
                ' BTU',
                ' Hz',
                ' K',
                ' MBTU',
                ' MMBTU',
                ' MWh',
                ' V',
                ' W',
                ' W/m²',
                ' Wh',
                ' bar',
                ' d',
                ' g CO₂ (Gas)',
                ' g CO₂ (Oil)',
                ' gal',
                ' gal/h',
                ' gal/min',
                ' h',
                ' hPa',
                ' kW',
                ' kWh',
                ' kWh/(m²*d)',
                ' kg CO₂ (Gas)',
                ' kg CO₂ (Oil)',
                ' kg/h',
                ' kg/m³',
                ' l',
                ' l/(m²*d)',
                ' l/h',
                ' l/min',
                ' m/s',
                ' mA',
                ' min',
                ' ms',
                ' m²',
                ' m³',
                ' m³/h',
                ' psi',
                ' s',
                ' t CO₂ (Gas)',
                ' t CO₂ (Oil)',
                ' °',
                ' °C',
                ' °F',
                ' µV',
                ' \u2126',  // OHM SIGN
                '%',
                '000_4_0',
                '004_4_0',
                '008_4_0',
                '012_4_0',
                '016_4_0',
                '020_4_0',
                '024_4_0',
                '028_4_0',
                '032_4_0',
                '036_4_0',
                '040_4_0',
                '044_4_0',
                '048_4_0',
                '052_4_0',
                '056_4_0',
                '060_4_0',
                '064_4_0',
                '068_2_0',
                '5 min error code',
                '5-Min-Fehlercode',
                'Bars',
                'Btus',
                'Chaleur solaire',
                'Code erreur 5 min',
                'CubicMeters',
                'CubicMetersPerHour',
                'DFA',
                'Date measured values',
                'Date valeurs de mesure',
                'Datum_Messdaten',
                'Days',
                'DegreesAngular',
                'DegreesCelsius',
                'DegreesFahrenheit',
                'DegreesKelvin',
                'DeltaSol MX [WMZ #0]',
                'DeltaSol MX [WMZ #10]',
                'DeltaSol MX [WMZ #11]',
                'DeltaSol MX [WMZ #12]',
                'DeltaSol MX [WMZ #13]',
                'DeltaSol MX [WMZ #14]',
                'DeltaSol MX [WMZ #15]',
                'DeltaSol MX [WMZ #1]',
                'DeltaSol MX [WMZ #2]',
                'DeltaSol MX [WMZ #3]',
                'DeltaSol MX [WMZ #4]',
                'DeltaSol MX [WMZ #5]',
                'DeltaSol MX [WMZ #6]',
                'DeltaSol MX [WMZ #7]',
                'DeltaSol MX [WMZ #8]',
                'DeltaSol MX [WMZ #9]',
                'DeltaSol MX [WMZ #]',
                'Einstrahlung',
                'Gallons',
                'GallonsPerHour',
                'GallonsPerMinute',
                'Gesamtvolumen',
                'GramsCO2Gas',
                'GramsCO2Oil',
                'Heat quantity',
                'Heat quantity 1',
                'Heat quantity 2',
                'Heat quantity today',
                'Heat quantity week',
                'Hectopascals',
                'Hertz',
                'Hours',
                'IOC-Modul [Messwerte]',
                'Intensité courant 1',
                'Intensité courant 2',
                'Irradiation',
                'KiloBtus',
                'KiloWattHoursPerSquareMeterPerDay',
                'KilogramsCO2Gas',
                'KilogramsCO2Oil',
                'KilogramsPerCubicMeter',
                'KilogramsPerHour',
                'KilowattHours',
                'Kilowatts',
                'Liters',
                'LitersPerHour',
                'LitersPerMinute',
                'LitersPerSquareMeterPerDay',
                'MegaBtus',
                'MegawattHours',
                'MetersPerSecond',
                'Microvolts',
                'Milliamperes',
                'Milliseconds',
                'Minutes',
                'None',
                'N° secondes',
                'Ohms',
                'Percent',
                'PoundsForcePerSquareInch',
                'Quantité de chaleur',
                'Quantité de chaleur 1',
                'Quantité de chaleur 2',
                'Quantité de chaleur aujourd\'hui',
                'Quantité de chaleur semaine',
                'Rated current 1',
                'Rated current 2',
                'S6',
                'S7',
                'Seconds',
                'Seconds no.',
                'SekNr',
                'Solar heat',
                'Solarwärme',
                'SquareMeters',
                'Stromstärke 1',
                'Stromstärke 2',
                'T- Départ / S1',
                'T-Ambiance',
                'T-Retour /S2',
                'T-Rücklauf/S2',
                'T-Umgebung',
                'T-Vorlauf/S1',
                'T-ambient',
                'T-flow / S1',
                'T-return / S2',
                'TSL',
                'Tmax-Temp_/S5',
                'TonsCO2Gas',
                'TonsCO2Oil',
                'Volts',
                'Volumen Monat',
                'Volumen Woche',
                'Volumen heute',
                'Volumenstr_1',
                'Volumenstr_2',
                'WattHours',
                'Watts',
                'WattsPerSquareMeter',
                'Wärmemenge',
                'Wärmemenge 1',
                'Wärmemenge 2',
                'Wärmemenge Monat',
                'Wärmemenge Woche',
                'Wärmemenge heute',
            ]);

            expect(specFile.localizedTexts).toEqual([{
                en: '5 min error code',
                de: '5-Min-Fehlercode',
                fr: 'Code erreur 5 min'
            }, {
                en: 'DFA',
                de: 'DFA',
                fr: 'DFA'
            }, {
                en: 'Date measured values',
                de: 'Datum_Messdaten',
                fr: 'Date valeurs de mesure'
            }, {
                en: 'DeltaSol MX [WMZ #0]',
                de: 'DeltaSol MX [WMZ #0]',
                fr: 'DeltaSol MX [WMZ #0]'
            }, {
                en: 'DeltaSol MX [WMZ #10]',
                de: 'DeltaSol MX [WMZ #10]',
                fr: 'DeltaSol MX [WMZ #10]'
            }, {
                en: 'DeltaSol MX [WMZ #11]',
                de: 'DeltaSol MX [WMZ #11]',
                fr: 'DeltaSol MX [WMZ #11]'
            }, {
                en: 'DeltaSol MX [WMZ #12]',
                de: 'DeltaSol MX [WMZ #12]',
                fr: 'DeltaSol MX [WMZ #12]'
            }, {
                en: 'DeltaSol MX [WMZ #13]',
                de: 'DeltaSol MX [WMZ #13]',
                fr: 'DeltaSol MX [WMZ #13]'
            }, {
                en: 'DeltaSol MX [WMZ #14]',
                de: 'DeltaSol MX [WMZ #14]',
                fr: 'DeltaSol MX [WMZ #14]'
            }, {
                en: 'DeltaSol MX [WMZ #15]',
                de: 'DeltaSol MX [WMZ #15]',
                fr: 'DeltaSol MX [WMZ #15]'
            }, {
                en: 'DeltaSol MX [WMZ #1]',
                de: 'DeltaSol MX [WMZ #1]',
                fr: 'DeltaSol MX [WMZ #1]'
            }, {
                en: 'DeltaSol MX [WMZ #2]',
                de: 'DeltaSol MX [WMZ #2]',
                fr: 'DeltaSol MX [WMZ #2]'
            }, {
                en: 'DeltaSol MX [WMZ #3]',
                de: 'DeltaSol MX [WMZ #3]',
                fr: 'DeltaSol MX [WMZ #3]'
            }, {
                en: 'DeltaSol MX [WMZ #4]',
                de: 'DeltaSol MX [WMZ #4]',
                fr: 'DeltaSol MX [WMZ #4]'
            }, {
                en: 'DeltaSol MX [WMZ #5]',
                de: 'DeltaSol MX [WMZ #5]',
                fr: 'DeltaSol MX [WMZ #5]'
            }, {
                en: 'DeltaSol MX [WMZ #6]',
                de: 'DeltaSol MX [WMZ #6]',
                fr: 'DeltaSol MX [WMZ #6]'
            }, {
                en: 'DeltaSol MX [WMZ #7]',
                de: 'DeltaSol MX [WMZ #7]',
                fr: 'DeltaSol MX [WMZ #7]'
            }, {
                en: 'DeltaSol MX [WMZ #8]',
                de: 'DeltaSol MX [WMZ #8]',
                fr: 'DeltaSol MX [WMZ #8]'
            }, {
                en: 'DeltaSol MX [WMZ #9]',
                de: 'DeltaSol MX [WMZ #9]',
                fr: 'DeltaSol MX [WMZ #9]'
            }, {
                en: 'DeltaSol MX [WMZ #]',
                de: 'DeltaSol MX [WMZ #]',
                fr: 'DeltaSol MX [WMZ #]'
            }, {
                en: 'Irradiation',
                de: 'Einstrahlung',
                fr: 'Irradiation'
            }, {
                en: 'Gesamtvolumen',
                de: 'Gesamtvolumen',
                fr: 'Gesamtvolumen'
            }, {
                en: 'IOC-Modul [Messwerte]',
                de: 'IOC-Modul [Messwerte]',
                fr: 'IOC-Modul [Messwerte]'
            }, {
                en: 'S6',
                de: 'S6',
                fr: 'S6'
            }, {
                en: 'S7',
                de: 'S7',
                fr: 'S7'
            }, {
                en: 'Seconds no.',
                de: 'SekNr',
                fr: 'N° secondes'
            }, {
                en: 'Solar heat',
                de: 'Solarwärme',
                fr: 'Chaleur solaire'
            }, {
                en: 'Rated current 1',
                de: 'Stromstärke 1',
                fr: 'Intensité courant 1'
            }, {
                en: 'Rated current 2',
                de: 'Stromstärke 2',
                fr: 'Intensité courant 2'
            }, {
                en: 'T-return / S2',
                de: 'T-Rücklauf/S2',
                fr: 'T-Retour /S2'
            }, {
                en: 'T-ambient',
                de: 'T-Umgebung',
                fr: 'T-Ambiance'
            }, {
                en: 'T-flow / S1',
                de: 'T-Vorlauf/S1',
                fr: 'T- Départ / S1'
            }, {
                en: 'TSL',
                de: 'TSL',
                fr: 'TSL'
            }, {
                en: 'Tmax-Temp_/S5',
                de: 'Tmax-Temp_/S5',
                fr: 'Tmax-Temp_/S5'
            }, {
                en: 'Volumen Monat',
                de: 'Volumen Monat',
                fr: 'Volumen Monat'
            }, {
                en: 'Volumen Woche',
                de: 'Volumen Woche',
                fr: 'Volumen Woche'
            }, {
                en: 'Volumen heute',
                de: 'Volumen heute',
                fr: 'Volumen heute'
            }, {
                en: 'Volumenstr_1',
                de: 'Volumenstr_1',
                fr: 'Volumenstr_1'
            }, {
                en: 'Volumenstr_2',
                de: 'Volumenstr_2',
                fr: 'Volumenstr_2'
            }, {
                en: 'Heat quantity',
                de: 'Wärmemenge',
                fr: 'Quantité de chaleur'
            }, {
                en: 'Heat quantity 1',
                de: 'Wärmemenge 1',
                fr: 'Quantité de chaleur 1'
            }, {
                en: 'Heat quantity 2',
                de: 'Wärmemenge 2',
                fr: 'Quantité de chaleur 2'
            }, {
                en: 'Wärmemenge Monat',
                de: 'Wärmemenge Monat',
                fr: 'Wärmemenge Monat'
            }, {
                en: 'Heat quantity week',
                de: 'Wärmemenge Woche',
                fr: 'Quantité de chaleur semaine'
            }, {
                en: 'Heat quantity today',
                de: 'Wärmemenge heute',
                fr: 'Quantité de chaleur aujourd\'hui'
            }]);

            expect(specFile.units).toEqual([{
                unitId: 55,
                unitFamily: unitFamilyByCode.Pressure,
                unitCode: 'Bars',
                unitText: ' bar'
            }, {
                unitId: 20,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'Btus',
                unitText: ' BTU'
            }, {
                unitId: 80,
                unitFamily: unitFamilyByCode.Volume,
                unitCode: 'CubicMeters',
                unitText: ' m³'
            }, {
                unitId: 135,
                unitFamily: unitFamilyByCode.VolumeFlow,
                unitCode: 'CubicMetersPerHour',
                unitText: ' m³/h'
            }, {
                unitId: 70,
                unitFamily: null,
                unitCode: 'Days',
                unitText: ' d'
            }, {
                unitId: 90,
                unitFamily: null,
                unitCode: 'DegreesAngular',
                unitText: ' °'
            }, {
                unitId: 62,
                unitFamily: unitFamilyByCode.Temperature,
                unitCode: 'DegreesCelsius',
                unitText: ' °C'
            }, {
                unitId: 64,
                unitFamily: unitFamilyByCode.Temperature,
                unitCode: 'DegreesFahrenheit',
                unitText: ' °F'
            }, {
                unitId: 63,
                unitFamily: null,
                unitCode: 'DegreesKelvin',
                unitText: ' K'
            }, {
                unitId: 1042,
                unitFamily: unitFamilyByCode.Volume,
                unitCode: 'Gallons',
                unitText: ' gal'
            }, {
                unitId: 1041,
                unitFamily: unitFamilyByCode.VolumeFlow,
                unitCode: 'GallonsPerHour',
                unitText: ' gal/h'
            }, {
                unitId: 1040,
                unitFamily: unitFamilyByCode.VolumeFlow,
                unitCode: 'GallonsPerMinute',
                unitText: ' gal/min'
            }, {
                unitId: 1035,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'GramsCO2Gas',
                unitText: ' g CO₂ (Gas)'
            }, {
                unitId: 1032,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'GramsCO2Oil',
                unitText: ' g CO₂ (Oil)'
            }, {
                unitId: 133,
                unitFamily: null,
                unitCode: 'Hectopascals',
                unitText: ' hPa'
            }, {
                unitId: 27,
                unitFamily: null,
                unitCode: 'Hertz',
                unitText: ' Hz'
            }, {
                unitId: 71,
                unitFamily: null,
                unitCode: 'Hours',
                unitText: ' h'
            }, {
                unitId: 1030,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'KiloBtus',
                unitText: ' MBTU'
            }, {
                unitId: 1024,
                unitFamily: null,
                unitCode: 'KiloWattHoursPerSquareMeterPerDay',
                unitText: ' kWh/(m²*d)'
            }, {
                unitId: 1036,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'KilogramsCO2Gas',
                unitText: ' kg CO₂ (Gas)'
            }, {
                unitId: 1033,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'KilogramsCO2Oil',
                unitText: ' kg CO₂ (Oil)'
            }, {
                unitId: 186,
                unitFamily: null,
                unitCode: 'KilogramsPerCubicMeter',
                unitText: ' kg/m³'
            }, {
                unitId: 44,
                unitFamily: null,
                unitCode: 'KilogramsPerHour',
                unitText: ' kg/h'
            }, {
                unitId: 19,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'KilowattHours',
                unitText: ' kWh'
            }, {
                unitId: 48,
                unitFamily: null,
                unitCode: 'Kilowatts',
                unitText: ' kW'
            }, {
                unitId: 82,
                unitFamily: unitFamilyByCode.Volume,
                unitCode: 'Liters',
                unitText: ' l'
            }, {
                unitId: 136,
                unitFamily: unitFamilyByCode.VolumeFlow,
                unitCode: 'LitersPerHour',
                unitText: ' l/h'
            }, {
                unitId: 88,
                unitFamily: unitFamilyByCode.VolumeFlow,
                unitCode: 'LitersPerMinute',
                unitText: ' l/min'
            }, {
                unitId: 1025,
                unitFamily: null,
                unitCode: 'LitersPerSquareMeterPerDay',
                unitText: ' l/(m²*d)'
            }, {
                unitId: 1031,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'MegaBtus',
                unitText: ' MMBTU'
            }, {
                unitId: 146,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'MegawattHours',
                unitText: ' MWh'
            }, {
                unitId: 74,
                unitFamily: null,
                unitCode: 'MetersPerSecond',
                unitText: ' m/s'
            }, {
                unitId: 1100,
                unitFamily: null,
                unitCode: 'Microvolts',
                unitText: ' µV'
            }, {
                unitId: 2,
                unitFamily: null,
                unitCode: 'Milliamperes',
                unitText: ' mA'
            }, {
                unitId: 159,
                unitFamily: null,
                unitCode: 'Milliseconds',
                unitText: ' ms'
            }, {
                unitId: 72,
                unitFamily: null,
                unitCode: 'Minutes',
                unitText: ' min'
            }, {
                unitId: -1,
                unitFamily: null,
                unitCode: 'None',
                unitText: ''
            }, {
                unitId: 4,
                unitFamily: null,
                unitCode: 'Ohms',
                unitText: ' \u2126'
            }, {
                unitId: 98,
                unitFamily: null,
                unitCode: 'Percent',
                unitText: '%'
            }, {
                unitId: 56,
                unitFamily: unitFamilyByCode.Pressure,
                unitCode: 'PoundsForcePerSquareInch',
                unitText: ' psi'
            }, {
                unitId: 73,
                unitFamily: null,
                unitCode: 'Seconds',
                unitText: ' s'
            }, {
                unitId: 0,
                unitFamily: null,
                unitCode: 'SquareMeters',
                unitText: ' m²'
            }, {
                unitId: 1037,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'TonsCO2Gas',
                unitText: ' t CO₂ (Gas)'
            }, {
                unitId: 1034,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'TonsCO2Oil',
                unitText: ' t CO₂ (Oil)'
            }, {
                unitId: 5,
                unitFamily: null,
                unitCode: 'Volts',
                unitText: ' V'
            }, {
                unitId: 18,
                unitFamily: unitFamilyByCode.Energy,
                unitCode: 'WattHours',
                unitText: ' Wh'
            }, {
                unitId: 47,
                unitFamily: null,
                unitCode: 'Watts',
                unitText: ' W'
            }, {
                unitId: 35,
                unitFamily: null,
                unitCode: 'WattsPerSquareMeter',
                unitText: ' W/m²'
            }]);

            expectOwnPropertyNamesToEqual(specFile.unitById, [
                '-1',
                '0',
                '1024',
                '1025',
                '1030',
                '1031',
                '1032',
                '1033',
                '1034',
                '1035',
                '1036',
                '1037',
                '1040',
                '1041',
                '1042',
                '1100',
                '133',
                '135',
                '136',
                '146',
                '159',
                '18',
                '186',
                '19',
                '2',
                '20',
                '27',
                '35',
                '4',
                '44',
                '47',
                '48',
                '5',
                '55',
                '56',
                '62',
                '63',
                '64',
                '70',
                '71',
                '72',
                '73',
                '74',
                '80',
                '82',
                '88',
                '90',
                '98'
            ]);

            expectOwnPropertyNamesToEqual(specFile.unitByCode, [
                'Bars',
                'Btus',
                'CubicMeters',
                'CubicMetersPerHour',
                'Days',
                'DegreesAngular',
                'DegreesCelsius',
                'DegreesFahrenheit',
                'DegreesKelvin',
                'Gallons',
                'GallonsPerHour',
                'GallonsPerMinute',
                'GramsCO2Gas',
                'GramsCO2Oil',
                'Hectopascals',
                'Hertz',
                'Hours',
                'KiloBtus',
                'KiloWattHoursPerSquareMeterPerDay',
                'KilogramsCO2Gas',
                'KilogramsCO2Oil',
                'KilogramsPerCubicMeter',
                'KilogramsPerHour',
                'KilowattHours',
                'Kilowatts',
                'Liters',
                'LitersPerHour',
                'LitersPerMinute',
                'LitersPerSquareMeterPerDay',
                'MegaBtus',
                'MegawattHours',
                'MetersPerSecond',
                'Microvolts',
                'Milliamperes',
                'Milliseconds',
                'Minutes',
                'None',
                'Ohms',
                'Percent',
                'PoundsForcePerSquareInch',
                'Seconds',
                'SquareMeters',
                'TonsCO2Gas',
                'TonsCO2Oil',
                'Volts',
                'WattHours',
                'Watts',
                'WattsPerSquareMeter'
            ]);

            expect(specFile.deviceTemplates).toHaveLength(18);

            const dt = specFile.deviceTemplates [0];

            expectOwnPropertyNamesToEqual(dt, [
                'name',
                'peerAddress',
                'peerMask',
                'selfAddress',
                'selfMask',
            ]);
            expect(dt.selfAddress).toBe(0x0010);
            expect(dt.selfMask).toBe(0xffff);
            expect(dt.peerAddress).toBe(0x0000);
            expect(dt.peerMask).toBe(0x0000);
            expect(dt.name).toEqual({
                en: 'DFA',
                de: 'DFA',
                fr: 'DFA',
            });

            expect(specFile.packetTemplates).toHaveLength(2);

            const pt = specFile.packetTemplates [0];

            expectOwnPropertyNamesToEqual(pt, [
                'command',
                'destinationAddress',
                'destinationMask',
                'fields',
                'sourceAddress',
                'sourceMask',
            ]);
            expect(pt.destinationAddress).toBe(0x0010);
            expect(pt.destinationMask).toBe(0xffff);
            expect(pt.sourceAddress).toBe(0x7e30);
            expect(pt.sourceMask).toBe(0xfff0);
            expect(pt.command).toBe(0x0100);
            expect(pt.fields).toHaveLength(8);

            const ptf = pt.fields [0];

            expectOwnPropertyNamesToEqual(ptf, [
                'id',
                'name',
                'parts',
                'precision',
                'type',
                'unit',
            ]);
            expect(ptf.id).toBe('000_4_0');
            expect(ptf.name).toEqual({
                en: 'Heat quantity',
                de: 'Wärmemenge',
                fr: 'Quantité de chaleur',
            });
            expect(ptf.unit).toBe(specFile.unitByCode.WattHours);
            expect(ptf.precision).toBe(0);
            expect(ptf.type).toBe(specFile.typeByCode.Number);
            expect(ptf.parts).toEqual([
                { offset:  0, bitPos: 0, mask: 0xff, isSigned: false, factor: 1 },
                { offset:  1, bitPos: 0, mask: 0xff, isSigned: false, factor: 256 },
                { offset:  2, bitPos: 0, mask: 0xff, isSigned: false, factor: 65536 },
                { offset:  3, bitPos: 0, mask: 0xff, isSigned: true,  factor: 16777216 },
                { offset: 36, bitPos: 0, mask: 0xff, isSigned: false, factor: 1000000000 },
                { offset: 37, bitPos: 0, mask: 0xff, isSigned: false, factor: 256000000000 },
                { offset: 38, bitPos: 0, mask: 0xff, isSigned: false, factor: 65536000000000 },
                { offset: 39, bitPos: 0, mask: 0xff, isSigned: true,  factor: 16777216000000000 },
            ]);
        });

    });

    describe('getDefaultSpecificationFile', () => {

        it('should work correctly', () => {
            const specFile = SpecificationFile.getDefaultSpecificationFile();

            expect(specFile).toBeInstanceOf(SpecificationFile);
        });

    });

    describe('loadFromFile', () => {

        it('should work correctly', async () => {
            const specFile = await SpecificationFile.loadFromFile(testVsf1Filename);

            expect(specFile).toBeInstanceOf(SpecificationFile);
        });

    });

});
