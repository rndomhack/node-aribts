import * as descriptorIndex from "./descriptor/index";

export type TsDescriptor = (
    descriptorIndex.TsDescriptorBase |
    descriptorIndex.TsDescriptorVideoStream |
    descriptorIndex.TsDescriptorAudioStream |
    descriptorIndex.TsDescriptorHierarchy |
    descriptorIndex.TsDescriptorRegistration |
    descriptorIndex.TsDescriptorDataStreamAlignment |
    descriptorIndex.TsDescriptorTargetBackgroundGrid |
    descriptorIndex.TsDescriptorVideoWindow |
    descriptorIndex.TsDescriptorConditionalAccess |
    descriptorIndex.TsDescriptorIso639Language |
    descriptorIndex.TsDescriptorSystemClock |
    descriptorIndex.TsDescriptorMultiplexBufferUtilization |
    descriptorIndex.TsDescriptorCopyright |
    descriptorIndex.TsDescriptorPrivateDataIndicator |
    descriptorIndex.TsDescriptorSmoothingBuffer |
    descriptorIndex.TsDescriptorStd |
    descriptorIndex.TsDescriptorIbp |
    descriptorIndex.TsDescriptorNetworkName |
    descriptorIndex.TsDescriptorServiceList |
    descriptorIndex.TsDescriptorStuffing |
    descriptorIndex.TsDescriptorSatelliteDeliverySystem |
    descriptorIndex.TsDescriptorCableDeliverySystem |
    descriptorIndex.TsDescriptorBouquetName |
    descriptorIndex.TsDescriptorService |
    descriptorIndex.TsDescriptorCountryAvailability |
    descriptorIndex.TsDescriptorLinkage |
    descriptorIndex.TsDescriptorNearVideoOnDemandReference |
    descriptorIndex.TsDescriptorTimeShiftedService |
    descriptorIndex.TsDescriptorShortEvent |
    descriptorIndex.TsDescriptorExtendedEvent |
    descriptorIndex.TsDescriptorTimeShiftedEvent |
    descriptorIndex.TsDescriptorComponent |
    descriptorIndex.TsDescriptorMosaic |
    descriptorIndex.TsDescriptorStreamIdentifier |
    descriptorIndex.TsDescriptorCaIdentifier |
    descriptorIndex.TsDescriptorContent |
    descriptorIndex.TsDescriptorParentalRating |
    descriptorIndex.TsDescriptorLocalTimeOffset |
    descriptorIndex.TsDescriptorPartialTransportStream |
    descriptorIndex.TsDescriptorDataBroadcastId |
    descriptorIndex.TsDescriptorMaterialInformation |
    descriptorIndex.TsDescriptorHybridInformation |
    descriptorIndex.TsDescriptorHierarchicalTransmission |
    descriptorIndex.TsDescriptorDigitalCopyControl |
    descriptorIndex.TsDescriptorNetworkIdentification |
    descriptorIndex.TsDescriptorPartialTransportStreamTime |
    descriptorIndex.TsDescriptorAudioComponent |
    descriptorIndex.TsDescriptorHyperlink |
    descriptorIndex.TsDescriptorTargetRegion |
    descriptorIndex.TsDescriptorDataContent |
    descriptorIndex.TsDescriptorVideoDecodeControl |
    descriptorIndex.TsDescriptorDownloadContent |
    descriptorIndex.TsDescriptorCaEmmTs |
    descriptorIndex.TsDescriptorCaContractInfo |
    descriptorIndex.TsDescriptorCaService |
    descriptorIndex.TsDescriptorTsInformation |
    descriptorIndex.TsDescriptorExtendedBroadcaster |
    descriptorIndex.TsDescriptorLogoTransmission |
    descriptorIndex.TsDescriptorBasicLocalEvent |
    descriptorIndex.TsDescriptorReference |
    descriptorIndex.TsDescriptorNodeRelation |
    descriptorIndex.TsDescriptorShortNodeInformation |
    descriptorIndex.TsDescriptorStcReference |
    descriptorIndex.TsDescriptorSeries |
    descriptorIndex.TsDescriptorEventGroup |
    descriptorIndex.TsDescriptorSiParameter |
    descriptorIndex.TsDescriptorBroadcasterName |
    descriptorIndex.TsDescriptorComponentGroup |
    descriptorIndex.TsDescriptorSiPrimeTs |
    descriptorIndex.TsDescriptorBoardInformation |
    descriptorIndex.TsDescriptorLdtLinkage |
    descriptorIndex.TsDescriptorConnectedTransmission |
    descriptorIndex.TsDescriptorContentAvailability |
    descriptorIndex.TsDescriptorServiceGroup |
    descriptorIndex.TsDescriptorAreaBroadcastingInformation |
    descriptorIndex.TsDescriptorNetworkDownloadContent |
    descriptorIndex.TsDescriptorDlProtection |
    descriptorIndex.TsDescriptorCaStartup |
    descriptorIndex.TsDescriptorCableMulticarrierTransmissionDeliverySystem |
    descriptorIndex.TsDescriptorAdvancedCableDeliverySystem |
    descriptorIndex.TsDescriptorScrambleSystem |
    descriptorIndex.TsDescriptorAccessControl |
    descriptorIndex.TsDescriptorCarouselCompatibleComposite |
    descriptorIndex.TsDescriptorConditionalPlayback |
    descriptorIndex.TsDescriptorCableTsDivisionSystem |
    descriptorIndex.TsDescriptorTerrestrialDeliverySystem |
    descriptorIndex.TsDescriptorPartialReception |
    descriptorIndex.TsDescriptorEmergencyInformation |
    descriptorIndex.TsDescriptorDataComponent |
    descriptorIndex.TsDescriptorSystemManagement
);

export default class TsDescriptors {
    buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    decode(): TsDescriptor[] {
        const tsDescriptors: TsDescriptor[] = [];

        for (let bytesRead = 0, l = this.buffer.length; bytesRead < l; ) {
            let tsDescriptor: TsDescriptor;

            const descriptorTag = this.buffer[bytesRead++];
            const descriptorLength = this.buffer[bytesRead++];

            const buffer = this.buffer.slice(bytesRead - 2, bytesRead + descriptorLength);
            bytesRead += descriptorLength;

            switch (descriptorTag) {
                case 0x00:
                case 0x01: {
                    // Reserved

                    break;
                }

                case 0x02: {
                    // Video stream
                    tsDescriptor = new descriptorIndex.TsDescriptorVideoStream(buffer);
                    break;
                }

                case 0x03: {
                    // Audio stream
                    tsDescriptor = new descriptorIndex.TsDescriptorAudioStream(buffer);

                    break;
                }

                case 0x04: {
                    // Hierarchy
                    tsDescriptor = new descriptorIndex.TsDescriptorHierarchy(buffer);

                    break;
                }

                case 0x05: {
                    // Registration
                    tsDescriptor = new descriptorIndex.TsDescriptorRegistration(buffer);

                    break;
                }

                case 0x06: {
                    // Data stream alignment
                    tsDescriptor = new descriptorIndex.TsDescriptorDataStreamAlignment(buffer);

                    break;
                }

                case 0x07: {
                    // Target background grid
                    tsDescriptor = new descriptorIndex.TsDescriptorTargetBackgroundGrid(buffer);

                    break;
                }

                case 0x08: {
                    // Video window
                    tsDescriptor = new descriptorIndex.TsDescriptorVideoWindow(buffer);

                    break;
                }

                case 0x09: {
                    // Conditional access
                    tsDescriptor = new descriptorIndex.TsDescriptorConditionalAccess(buffer);

                    break;
                }

                case 0x0A: {
                    // ISO 639 language
                    tsDescriptor = new descriptorIndex.TsDescriptorIso639Language(buffer);

                    break;
                }

                case 0x0B: {
                    // System clock
                    tsDescriptor = new descriptorIndex.TsDescriptorSystemClock(buffer);

                    break;
                }

                case 0x0C: {
                    // Multiplex buffer utilization
                    tsDescriptor = new descriptorIndex.TsDescriptorMultiplexBufferUtilization(buffer);

                    break;
                }

                case 0x0D: {
                    // Copyright
                    tsDescriptor = new descriptorIndex.TsDescriptorCopyright(buffer);

                    break;
                }

                case 0x0F: {
                    // Private data indicator
                    tsDescriptor = new descriptorIndex.TsDescriptorPrivateDataIndicator(buffer);

                    break;
                }

                case 0x10: {
                    // Smoothing buffer
                    tsDescriptor = new descriptorIndex.TsDescriptorSmoothingBuffer(buffer);

                    break;
                }

                case 0x11: {
                    // STD
                    tsDescriptor = new descriptorIndex.TsDescriptorStd(buffer);

                    break;
                }

                case 0x12: {
                    // IBP
                    tsDescriptor = new descriptorIndex.TsDescriptorIbp(buffer);

                    break;
                }

                case 0x40: {
                    // Network name
                    tsDescriptor = new descriptorIndex.TsDescriptorNetworkName(buffer);

                    break;
                }

                case 0x41: {
                    // Service list
                    tsDescriptor = new descriptorIndex.TsDescriptorServiceList(buffer);

                    break;
                }

                case 0x42: {
                    // Stuffing
                    tsDescriptor = new descriptorIndex.TsDescriptorStuffing(buffer);

                    break;
                }

                case 0x43: {
                    //Satellite delivery system
                    tsDescriptor = new descriptorIndex.TsDescriptorSatelliteDeliverySystem(buffer);

                    break;
                }

                case 0x44: {
                    //Cable delivery system
                    tsDescriptor = new descriptorIndex.TsDescriptorCableDeliverySystem(buffer);

                    break;
                }

                case 0x47: {
                    // Bouquet name
                    tsDescriptor = new descriptorIndex.TsDescriptorBouquetName(buffer);

                    break;
                }

                case 0x48: {
                    // Service
                    tsDescriptor = new descriptorIndex.TsDescriptorService(buffer);

                    break;
                }

                case 0x49: {
                    // Country availability
                    tsDescriptor = new descriptorIndex.TsDescriptorCountryAvailability(buffer);

                    break;
                }

                case 0x4A: {
                    // Linkage
                    tsDescriptor = new descriptorIndex.TsDescriptorLinkage(buffer);

                    break;
                }

                case 0x4B: {
                    //  Near Video On Demand reference
                    tsDescriptor = new descriptorIndex.TsDescriptorNearVideoOnDemandReference(buffer);

                    break;
                }

                case 0x4C: {
                    // Time shifted service
                    tsDescriptor = new descriptorIndex.TsDescriptorTimeShiftedService(buffer);

                    break;
                }

                case 0x4D: {
                    // Short event
                    tsDescriptor = new descriptorIndex.TsDescriptorShortEvent(buffer);

                    break;
                }

                case 0x4E: {
                    // Extended event
                    tsDescriptor = new descriptorIndex.TsDescriptorExtendedEvent(buffer);

                    break;
                }

                case 0x4F: {
                    // Time shifted event
                    tsDescriptor = new descriptorIndex.TsDescriptorTimeShiftedEvent(buffer);

                    break;
                }

                case 0x50: {
                    // Component
                    tsDescriptor = new descriptorIndex.TsDescriptorComponent(buffer);

                    break;
                }

                case 0x51: {
                    // Mosaic
                    tsDescriptor = new descriptorIndex.TsDescriptorMosaic(buffer);

                    break;
                }

                case 0x52: {
                    // Stream identifier
                    tsDescriptor = new descriptorIndex.TsDescriptorStreamIdentifier(buffer);

                    break;
                }

                case 0x53: {
                    // CA identifier
                    tsDescriptor = new descriptorIndex.TsDescriptorCaIdentifier(buffer);

                    break;
                }

                case 0x54: {
                    // Content
                    tsDescriptor = new descriptorIndex.TsDescriptorContent(buffer);

                    break;
                }

                case 0x55: {
                    // Parental rating
                    tsDescriptor = new descriptorIndex.TsDescriptorParentalRating(buffer);

                    break;
                }

                case 0x58: {
                    // Local time offset
                    tsDescriptor = new descriptorIndex.TsDescriptorLocalTimeOffset(buffer);

                    break;
                }

                case 0x63: {
                    // Partial transport stream
                    tsDescriptor = new descriptorIndex.TsDescriptorPartialTransportStream(buffer);

                    break;
                }

                case 0x66: {
                    // Data broadcast id
                    tsDescriptor = new descriptorIndex.TsDescriptorDataBroadcastId(buffer);

                    break;
                }

                case 0x67: {
                    // Material information
                    tsDescriptor = new descriptorIndex.TsDescriptorMaterialInformation(buffer);

                    break;
                }

                case 0x68: {
                    // Hybrid information
                    tsDescriptor = new descriptorIndex.TsDescriptorHybridInformation(buffer);

                    break;
                }

                case 0xC0: {
                    // Hierarchical transmission
                    tsDescriptor = new descriptorIndex.TsDescriptorHierarchicalTransmission(buffer);

                    break;
                }

                case 0xC1: {
                    // Digital copy control
                    tsDescriptor = new descriptorIndex.TsDescriptorDigitalCopyControl(buffer);

                    break;
                }

                case 0xC2: {
                    // Network identification
                    tsDescriptor = new descriptorIndex.TsDescriptorNetworkIdentification(buffer);

                    break;
                }

                case 0xC3: {
                    // Partial transport stream time
                    tsDescriptor = new descriptorIndex.TsDescriptorPartialTransportStreamTime(buffer);

                    break;
                }

                case 0xC4: {
                    // Audio component
                    tsDescriptor = new descriptorIndex.TsDescriptorAudioComponent(buffer);

                    break;
                }

                case 0xC5: {
                    // Hyperlink
                    tsDescriptor = new descriptorIndex.TsDescriptorHyperlink(buffer);

                    break;
                }

                case 0xC6: {
                    // Target region
                    tsDescriptor = new descriptorIndex.TsDescriptorTargetRegion(buffer);

                    break;
                }

                case 0xC7: {
                    // Data content
                    tsDescriptor = new descriptorIndex.TsDescriptorDataContent(buffer);

                    break;
                }

                case 0xC8: {
                    // Video decode control
                    tsDescriptor = new descriptorIndex.TsDescriptorVideoDecodeControl(buffer);

                    break;
                }

                case 0xC9: {
                    // Download content
                    tsDescriptor = new descriptorIndex.TsDescriptorDownloadContent(buffer);

                    break;
                }

                case 0xCA: {
                    // CA emm ts
                    tsDescriptor = new descriptorIndex.TsDescriptorCaEmmTs(buffer);

                    break;
                }

                case 0xCB: {
                    // CA contract info
                    tsDescriptor = new descriptorIndex.TsDescriptorCaContractInfo(buffer);

                    break;
                }

                case 0xCC: {
                    // CA service
                    tsDescriptor = new descriptorIndex.TsDescriptorCaService(buffer);

                    break;
                }

                case 0xCD: {
                    // TS information
                    tsDescriptor = new descriptorIndex.TsDescriptorTsInformation(buffer);

                    break;
                }

                case 0xCE: {
                    // Extended broadcaster
                    tsDescriptor = new descriptorIndex.TsDescriptorExtendedBroadcaster(buffer);

                    break;
                }

                case 0xCF: {
                    // Logo transmission
                    tsDescriptor = new descriptorIndex.TsDescriptorLogoTransmission(buffer);

                    break;
                }

                case 0xD0: {
                    // Basic local_event
                    tsDescriptor = new descriptorIndex.TsDescriptorBasicLocalEvent(buffer);

                    break;
                }

                case 0xD1: {
                    // Reference
                    tsDescriptor = new descriptorIndex.TsDescriptorReference(buffer);

                    break;
                }

                case 0xD2: {
                    // Node relation
                    tsDescriptor = new descriptorIndex.TsDescriptorNodeRelation(buffer);

                    break;
                }

                case 0xD3: {
                    // Short node information
                    tsDescriptor = new descriptorIndex.TsDescriptorShortNodeInformation(buffer);

                    break;
                }

                case 0xD4: {
                    // STC reference
                    tsDescriptor = new descriptorIndex.TsDescriptorStcReference(buffer);

                    break;
                }

                case 0xD5: {
                    // Series
                    tsDescriptor = new descriptorIndex.TsDescriptorSeries(buffer);

                    break;
                }

                case 0xD6: {
                    // Event group
                    tsDescriptor = new descriptorIndex.TsDescriptorEventGroup(buffer);

                    break;
                }

                case 0xD7: {
                    // SI parameter
                    tsDescriptor = new descriptorIndex.TsDescriptorSiParameter(buffer);

                    break;
                }

                case 0xD8: {
                    // Broadcaster name
                    tsDescriptor = new descriptorIndex.TsDescriptorBroadcasterName(buffer);

                    break;
                }

                case 0xD9: {
                    // Component group
                    tsDescriptor = new descriptorIndex.TsDescriptorComponentGroup(buffer);

                    break;
                }

                case 0xDA: {
                    // SI prime_ts
                    tsDescriptor = new descriptorIndex.TsDescriptorSiPrimeTs(buffer);

                    break;
                }

                case 0xDB: {
                    // Board information
                    tsDescriptor = new descriptorIndex.TsDescriptorBoardInformation(buffer);

                    break;
                }

                case 0xDC: {
                    // LDT linkage
                    tsDescriptor = new descriptorIndex.TsDescriptorLdtLinkage(buffer);

                    break;
                }

                case 0xDD: {
                    // Connected transmission
                    tsDescriptor = new descriptorIndex.TsDescriptorConnectedTransmission(buffer);

                    break;
                }

                case 0xDE: {
                    // Content availability
                    tsDescriptor = new descriptorIndex.TsDescriptorContentAvailability(buffer);

                    break;
                }

                case 0xDF: {
                    // Reserved

                    break;
                }

                case 0xE0: {
                    // Service group
                    tsDescriptor = new descriptorIndex.TsDescriptorServiceGroup(buffer);

                    break;
                }

                case 0xE1: {
                    // Area broadcasting information
                    tsDescriptor = new descriptorIndex.TsDescriptorAreaBroadcastingInformation(buffer);

                    break;
                }

                case 0xE2: {
                    // Network download content
                    tsDescriptor = new descriptorIndex.TsDescriptorNetworkDownloadContent(buffer);

                    break;
                }

                case 0xE3: {
                    // DL protection
                    tsDescriptor = new descriptorIndex.TsDescriptorDlProtection(buffer);

                    break;
                }

                case 0xE4: {
                    // CA startup
                    tsDescriptor = new descriptorIndex.TsDescriptorCaStartup(buffer);

                    break;
                }

                case 0xF3: {
                    // Cable multi-carrier transmission delivery system
                    tsDescriptor = new descriptorIndex.TsDescriptorCableMulticarrierTransmissionDeliverySystem(buffer);

                    break;
                }

                case 0xF4: {
                    // Advanced cable delivery system
                    tsDescriptor = new descriptorIndex.TsDescriptorAdvancedCableDeliverySystem(buffer);

                    break;
                }

                case 0xF5: {
                    // Scramble system
                    tsDescriptor = new descriptorIndex.TsDescriptorScrambleSystem(buffer);

                    break;
                }

                case 0xF6: {
                    // Access control
                    tsDescriptor = new descriptorIndex.TsDescriptorAccessControl(buffer);

                    break;
                }

                case 0xF7: {
                    // Carousel compatible composite
                    tsDescriptor = new descriptorIndex.TsDescriptorCarouselCompatibleComposite(buffer);

                    break;
                }

                case 0xF8: {
                    // Conditional playback
                    tsDescriptor = new descriptorIndex.TsDescriptorConditionalPlayback(buffer);

                    break;
                }

                case 0xF9: {
                    // Cable TS division system
                    tsDescriptor = new descriptorIndex.TsDescriptorCableTsDivisionSystem(buffer);

                    break;
                }

                case 0xFA: {
                    // Terrestrial delivery system
                    tsDescriptor = new descriptorIndex.TsDescriptorTerrestrialDeliverySystem(buffer);

                    break;
                }

                case 0xFB: {
                    // Partial reception
                    tsDescriptor = new descriptorIndex.TsDescriptorPartialReception(buffer);

                    break;
                }

                case 0xFC: {
                    // Emergency information
                    tsDescriptor = new descriptorIndex.TsDescriptorEmergencyInformation(buffer);

                    break;
                }

                case 0xFD: {
                    // Data component
                    tsDescriptor = new descriptorIndex.TsDescriptorDataComponent(buffer);

                    break;
                }

                case 0xFE: {
                    // System management
                    tsDescriptor = new descriptorIndex.TsDescriptorSystemManagement(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsDescriptor = new descriptorIndex.TsDescriptorBase(buffer);
                }
            }

            tsDescriptors.push(tsDescriptor);
        }

        return tsDescriptors;
    }
}
