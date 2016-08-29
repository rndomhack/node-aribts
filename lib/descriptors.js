"use strict";

const tsDescriptor = require("./descriptor");

class TsDescriptors {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        let arrDescriptors = [];

        for (let bytesRead = 0; bytesRead < this.buffer.length; ) {
            let objDescriptor;

            let descriptorTag = this.buffer[bytesRead++];
            let descriptorLength = this.buffer[bytesRead++];

            let buffer = this.buffer.slice(bytesRead - 2, bytesRead + descriptorLength);
            bytesRead += descriptorLength;

            switch (descriptorTag) {
                case 0x00:
                case 0x01:
                    // Reserved

                    break;

                case 0x02:
                    // Video stream descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorVideoStream(buffer).decode();
                    break;

                case 0x03:
                    // Audio stream descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorAudioStream(buffer).decode();

                    break;

                case 0x04:
                    // Hierarchy descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorHierarchy(buffer).decode();

                    break;

                case 0x05:
                    // Registration descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorRegistration(buffer).decode();

                    break;

                case 0x06:
                    // Data stream alignment descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDataStreamAlignment(buffer).decode();

                    break;

                case 0x07:
                    // Target background grid descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTargetBackgroundGrid(buffer).decode();

                    break;

                case 0x08:
                    // Video window descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorVideoWindow(buffer).decode();

                    break;

                case 0x09:
                    // Conditional access descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorConditionalAccess(buffer).decode();

                    break;

                case 0x0A:
                    // ISO 639 language descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorIso639Language(buffer).decode();

                    break;

                case 0x0B:
                    // System clock descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSystemClock(buffer).decode();

                    break;

                case 0x0C:
                    // Multiplex buffer utilization descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorMultiplexBufferUtilization(buffer).decode();

                    break;

                case 0x0D:
                    // Copyright descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCopyright(buffer).decode();

                    break;

                case 0x0F:
                    // Private data indicator descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorPrivateDataIndicator(buffer).decode();

                    break;

                case 0x10:
                    // Smoothing buffer descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSmoothingBuffer(buffer).decode();

                    break;

                case 0x11:
                    // STD descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorStd(buffer).decode();

                    break;

                case 0x12:
                    // IBP descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorIbp(buffer).decode();

                    break;

                case 0x40:
                    // Network name descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorNetworkName(buffer).decode();

                    break;

                case 0x41:
                    // Service list descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorServiceList(buffer).decode();

                    break;

                case 0x42:
                    // Stuffing descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorStuffing(buffer).decode();

                    break;

                case 0x43:
                    //Satellite delivery system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSatelliteDeliverySystem(buffer).decode();

                    break;

                case 0x44:
                    //Cable delivery system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCableDeliverySystem(buffer).decode();

                    break;

                case 0x47:
                    // Bouquet name descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorBouquetName(buffer).decode();

                    break;

                case 0x48:
                    // Service descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorService(buffer).decode();

                    break;

                case 0x49:
                    // Country availability descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCountryAvailability(buffer).decode();

                    break;

                case 0x4A:
                    // Linkage descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorLinkage(buffer).decode();

                    break;

                case 0x4B:
                    //  Near Video On Demand reference descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorNearVideoOnDemandReference(buffer).decode();

                    break;

                case 0x4C:
                    // Time shifted service descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTimeShiftedService(buffer).decode();

                    break;

                case 0x4D:
                    // Short event descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorShortEvent(buffer).decode();

                    break;

                case 0x4E:
                    // Extended event descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorExtendedEvent(buffer).decode();

                    break;

                case 0x4F:
                    // Time shifted event descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTimeShiftedEvent(buffer).decode();

                    break;

                case 0x50:
                    // Component descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorComponent(buffer).decode();

                    break;

                case 0x51:
                    // Mosaic descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorMosaic(buffer).decode();

                    break;

                case 0x52:
                    // Stream identifier descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorStreamIdentifier(buffer).decode();

                    break;

                case 0x53:
                    // CA identifier descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCaIdentifier(buffer).decode();

                    break;

                case 0x54:
                    // Content descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorContent(buffer).decode();

                    break;

                case 0x55:
                    // Parental rating descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorParentalRating(buffer).decode();

                    break;

                case 0x58:
                    // Local time offset descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorLocalTimeOffset(buffer).decode();

                    break;

                case 0x63:
                    // Partial transport stream descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorPartialTransportStream(buffer).decode();

                    break;

                case 0x66:
                    // Data broadcast id descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDataBroadcastId(buffer).decode();

                    break;

                case 0x67:
                    // Material information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorMaterialInformation(buffer).decode();

                    break;

                case 0x68:
                    // Hybrid information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorHybridInformation(buffer).decode();

                    break;

                case 0xC0:
                    // Hierarchical transmission descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorHierarchicalTransmission(buffer).decode();

                    break;

                case 0xC1:
                    // Digital copy control descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDigitalCopyControl(buffer).decode();

                    break;

                case 0xC2:
                    // Network identification descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorNetworkIdentification(buffer).decode();

                    break;

                case 0xC3:
                    // Partial transport stream time descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorPartialTransportStreamTime(buffer).decode();

                    break;

                case 0xC4:
                    // Audio component descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorAudioComponent(buffer).decode();

                    break;

                case 0xC5:
                    // Hyperlink descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorHyperlink(buffer).decode();

                    break;

                case 0xC6:
                    // Target region descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTargetRegion(buffer).decode();

                    break;

                case 0xC7:
                    // Data content descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDataContent(buffer).decode();

                    break;

                case 0xC8:
                    // Video decode control descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorVideoDecodeControl(buffer).decode();

                    break;

                case 0xC9:
                    // Download content descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDownloadContent(buffer).decode();

                    break;

                case 0xCA:
                    // CA emm ts descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCaEmmTs(buffer).decode();

                    break;

                case 0xCB:
                    // CA contract info descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCaContractInfo(buffer).decode();

                    break;

                case 0xCC:
                    // CA service descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCaService(buffer).decode();

                    break;

                case 0xCD:
                    // TS information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTsInformation(buffer).decode();

                    break;

                case 0xCE:
                    // Extended broadcaster descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorExtendedBroadcaster(buffer).decode();

                    break;

                case 0xCF:
                    // Logo transmission descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorLogoTransmission(buffer).decode();

                    break;

                case 0xD0:
                    // Basic local_event descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorBasicLocalEvent(buffer).decode();

                    break;

                case 0xD1:
                    // Reference descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorReference(buffer).decode();

                    break;

                case 0xD2:
                    // Node relation descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorNodeRelation(buffer).decode();

                    break;

                case 0xD3:
                    // Short node information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorShortNodeInformation(buffer).decode();

                    break;

                case 0xD4:
                    // STC reference descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorStcReference(buffer).decode();

                    break;

                case 0xD5:
                    // Series descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSeries(buffer).decode();

                    break;

                case 0xD6:
                    // Event group descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorEventGroup(buffer).decode();

                    break;

                case 0xD7:
                    // SI parameter descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSiParameter(buffer).decode();

                    break;

                case 0xD8:
                    // Broadcaster name descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorBroadcasterName(buffer).decode();

                    break;

                case 0xD9:
                    // Component group descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorComponentGroup(buffer).decode();

                    break;

                case 0xDA:
                    // SI prime_ts descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSiPrimeTs(buffer).decode();

                    break;

                case 0xDB:
                    // Board information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorBoardInformation(buffer).decode();

                    break;

                case 0xDC:
                    // LDT linkage descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorLdtLinkage(buffer).decode();

                    break;

                case 0xDD:
                    // Connected transmission descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorConnectedTransmission(buffer).decode();

                    break;

                case 0xDE:
                    // Content availability descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorContentAvailability(buffer).decode();

                    break;

                case 0xDF:
                    // Reserved

                    break;

                case 0xE0:
                    // Service group descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorServiceGroup(buffer).decode();

                    break;

                case 0xE1:
                    // Area broadcasting information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorAreaBroadcastingInformation(buffer).decode();

                    break;

                case 0xE2:
                    // Network download content descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorNetworkDownloadContent(buffer).decode();

                    break;

                case 0xE3:
                    // DL protection descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDlProtection(buffer).decode();

                    break;

                case 0xE4:
                    // CA startup descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCaStartup(buffer).decode();

                    break;

                case 0xF3:
                    // Cable multi-carrier transmission delivery system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCableMulticarrierTransmissionDeliverySystem(buffer).decode();

                    break;

                case 0xF4:
                    // Advanced cable delivery system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorAdvancedCableDeliverySystem(buffer).decode();

                    break;

                case 0xF5:
                    // Scramble system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorScrambleSystem(buffer).decode();

                    break;

                case 0xF6:
                    // Access control descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorAccessControl(buffer).decode();

                    break;

                case 0xF7:
                    // Carousel compatible composite descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCarouselCompatibleComposite(buffer).decode();

                    break;

                case 0xF8:
                    // Conditional playback descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorConditionalPlayback(buffer).decode();

                    break;

                case 0xF9:
                    // Cable TS division system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorCableTsDivisionSystem(buffer).decode();

                    break;

                case 0xFA:
                    // Terrestrial delivery system descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorTerrestrialDeliverySystem(buffer).decode();

                    break;

                case 0xFB:
                    // Partial reception descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorPartialReception(buffer).decode();

                    break;

                case 0xFC:
                    // Emergency information descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorEmergencyInformation(buffer).decode();

                    break;

                case 0xFD:
                    // Data component descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorDataComponent(buffer).decode();

                    break;

                case 0xFE:
                    // System management descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorSystemManagement(buffer).decode();

                    break;

                default:
                    // Unknown descriptor
                    objDescriptor = new tsDescriptor.TsDescriptorUnknown(buffer).decode();

            }

            arrDescriptors.push(objDescriptor);
        }

        return arrDescriptors;
    }
}

module.exports = TsDescriptors;
