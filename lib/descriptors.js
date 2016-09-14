"use strict";

const tsDescriptorList = require("./descriptor");

class TsDescriptors {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        const tsDescriptors = [];

        for (let bytesRead = 0, l = this.buffer.length; bytesRead < l; ) {
            let tsDescriptor;

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
                    tsDescriptor = new tsDescriptorList.TsDescriptorVideoStream(buffer);
                    break;
                }

                case 0x03: {
                    // Audio stream
                    tsDescriptor = new tsDescriptorList.TsDescriptorAudioStream(buffer);

                    break;
                }

                case 0x04: {
                    // Hierarchy
                    tsDescriptor = new tsDescriptorList.TsDescriptorHierarchy(buffer);

                    break;
                }

                case 0x05: {
                    // Registration
                    tsDescriptor = new tsDescriptorList.TsDescriptorRegistration(buffer);

                    break;
                }

                case 0x06: {
                    // Data stream alignment
                    tsDescriptor = new tsDescriptorList.TsDescriptorDataStreamAlignment(buffer);

                    break;
                }

                case 0x07: {
                    // Target background grid
                    tsDescriptor = new tsDescriptorList.TsDescriptorTargetBackgroundGrid(buffer);

                    break;
                }

                case 0x08: {
                    // Video window
                    tsDescriptor = new tsDescriptorList.TsDescriptorVideoWindow(buffer);

                    break;
                }

                case 0x09: {
                    // Conditional access
                    tsDescriptor = new tsDescriptorList.TsDescriptorConditionalAccess(buffer);

                    break;
                }

                case 0x0A: {
                    // ISO 639 language
                    tsDescriptor = new tsDescriptorList.TsDescriptorIso639Language(buffer);

                    break;
                }

                case 0x0B: {
                    // System clock
                    tsDescriptor = new tsDescriptorList.TsDescriptorSystemClock(buffer);

                    break;
                }

                case 0x0C: {
                    // Multiplex buffer utilization
                    tsDescriptor = new tsDescriptorList.TsDescriptorMultiplexBufferUtilization(buffer);

                    break;
                }

                case 0x0D: {
                    // Copyright
                    tsDescriptor = new tsDescriptorList.TsDescriptorCopyright(buffer);

                    break;
                }

                case 0x0F: {
                    // Private data indicator
                    tsDescriptor = new tsDescriptorList.TsDescriptorPrivateDataIndicator(buffer);

                    break;
                }

                case 0x10: {
                    // Smoothing buffer
                    tsDescriptor = new tsDescriptorList.TsDescriptorSmoothingBuffer(buffer);

                    break;
                }

                case 0x11: {
                    // STD
                    tsDescriptor = new tsDescriptorList.TsDescriptorStd(buffer);

                    break;
                }

                case 0x12: {
                    // IBP
                    tsDescriptor = new tsDescriptorList.TsDescriptorIbp(buffer);

                    break;
                }

                case 0x40: {
                    // Network name
                    tsDescriptor = new tsDescriptorList.TsDescriptorNetworkName(buffer);

                    break;
                }

                case 0x41: {
                    // Service list
                    tsDescriptor = new tsDescriptorList.TsDescriptorServiceList(buffer);

                    break;
                }

                case 0x42: {
                    // Stuffing
                    tsDescriptor = new tsDescriptorList.TsDescriptorStuffing(buffer);

                    break;
                }

                case 0x43: {
                    //Satellite delivery system
                    tsDescriptor = new tsDescriptorList.TsDescriptorSatelliteDeliverySystem(buffer);

                    break;
                }

                case 0x44: {
                    //Cable delivery system
                    tsDescriptor = new tsDescriptorList.TsDescriptorCableDeliverySystem(buffer);

                    break;
                }

                case 0x47: {
                    // Bouquet name
                    tsDescriptor = new tsDescriptorList.TsDescriptorBouquetName(buffer);

                    break;
                }

                case 0x48: {
                    // Service
                    tsDescriptor = new tsDescriptorList.TsDescriptorService(buffer);

                    break;
                }

                case 0x49: {
                    // Country availability
                    tsDescriptor = new tsDescriptorList.TsDescriptorCountryAvailability(buffer);

                    break;
                }

                case 0x4A: {
                    // Linkage
                    tsDescriptor = new tsDescriptorList.TsDescriptorLinkage(buffer);

                    break;
                }

                case 0x4B: {
                    //  Near Video On Demand reference
                    tsDescriptor = new tsDescriptorList.TsDescriptorNearVideoOnDemandReference(buffer);

                    break;
                }

                case 0x4C: {
                    // Time shifted service
                    tsDescriptor = new tsDescriptorList.TsDescriptorTimeShiftedService(buffer);

                    break;
                }

                case 0x4D: {
                    // Short event
                    tsDescriptor = new tsDescriptorList.TsDescriptorShortEvent(buffer);

                    break;
                }

                case 0x4E: {
                    // Extended event
                    tsDescriptor = new tsDescriptorList.TsDescriptorExtendedEvent(buffer);

                    break;
                }

                case 0x4F: {
                    // Time shifted event
                    tsDescriptor = new tsDescriptorList.TsDescriptorTimeShiftedEvent(buffer);

                    break;
                }

                case 0x50: {
                    // Component
                    tsDescriptor = new tsDescriptorList.TsDescriptorComponent(buffer);

                    break;
                }

                case 0x51: {
                    // Mosaic
                    tsDescriptor = new tsDescriptorList.TsDescriptorMosaic(buffer);

                    break;
                }

                case 0x52: {
                    // Stream identifier
                    tsDescriptor = new tsDescriptorList.TsDescriptorStreamIdentifier(buffer);

                    break;
                }

                case 0x53: {
                    // CA identifier
                    tsDescriptor = new tsDescriptorList.TsDescriptorCaIdentifier(buffer);

                    break;
                }

                case 0x54: {
                    // Content
                    tsDescriptor = new tsDescriptorList.TsDescriptorContent(buffer);

                    break;
                }

                case 0x55: {
                    // Parental rating
                    tsDescriptor = new tsDescriptorList.TsDescriptorParentalRating(buffer);

                    break;
                }

                case 0x58: {
                    // Local time offset
                    tsDescriptor = new tsDescriptorList.TsDescriptorLocalTimeOffset(buffer);

                    break;
                }

                case 0x63: {
                    // Partial transport stream
                    tsDescriptor = new tsDescriptorList.TsDescriptorPartialTransportStream(buffer);

                    break;
                }

                case 0x66: {
                    // Data broadcast id
                    tsDescriptor = new tsDescriptorList.TsDescriptorDataBroadcastId(buffer);

                    break;
                }

                case 0x67: {
                    // Material information
                    tsDescriptor = new tsDescriptorList.TsDescriptorMaterialInformation(buffer);

                    break;
                }

                case 0x68: {
                    // Hybrid information
                    tsDescriptor = new tsDescriptorList.TsDescriptorHybridInformation(buffer);

                    break;
                }

                case 0xC0: {
                    // Hierarchical transmission
                    tsDescriptor = new tsDescriptorList.TsDescriptorHierarchicalTransmission(buffer);

                    break;
                }

                case 0xC1: {
                    // Digital copy control
                    tsDescriptor = new tsDescriptorList.TsDescriptorDigitalCopyControl(buffer);

                    break;
                }

                case 0xC2: {
                    // Network identification
                    tsDescriptor = new tsDescriptorList.TsDescriptorNetworkIdentification(buffer);

                    break;
                }

                case 0xC3: {
                    // Partial transport stream time
                    tsDescriptor = new tsDescriptorList.TsDescriptorPartialTransportStreamTime(buffer);

                    break;
                }

                case 0xC4: {
                    // Audio component
                    tsDescriptor = new tsDescriptorList.TsDescriptorAudioComponent(buffer);

                    break;
                }

                case 0xC5: {
                    // Hyperlink
                    tsDescriptor = new tsDescriptorList.TsDescriptorHyperlink(buffer);

                    break;
                }

                case 0xC6: {
                    // Target region
                    tsDescriptor = new tsDescriptorList.TsDescriptorTargetRegion(buffer);

                    break;
                }

                case 0xC7: {
                    // Data content
                    tsDescriptor = new tsDescriptorList.TsDescriptorDataContent(buffer);

                    break;
                }

                case 0xC8: {
                    // Video decode control
                    tsDescriptor = new tsDescriptorList.TsDescriptorVideoDecodeControl(buffer);

                    break;
                }

                case 0xC9: {
                    // Download content
                    tsDescriptor = new tsDescriptorList.TsDescriptorDownloadContent(buffer);

                    break;
                }

                case 0xCA: {
                    // CA emm ts
                    tsDescriptor = new tsDescriptorList.TsDescriptorCaEmmTs(buffer);

                    break;
                }

                case 0xCB: {
                    // CA contract info
                    tsDescriptor = new tsDescriptorList.TsDescriptorCaContractInfo(buffer);

                    break;
                }

                case 0xCC: {
                    // CA service
                    tsDescriptor = new tsDescriptorList.TsDescriptorCaService(buffer);

                    break;
                }

                case 0xCD: {
                    // TS information
                    tsDescriptor = new tsDescriptorList.TsDescriptorTsInformation(buffer);

                    break;
                }

                case 0xCE: {
                    // Extended broadcaster
                    tsDescriptor = new tsDescriptorList.TsDescriptorExtendedBroadcaster(buffer);

                    break;
                }

                case 0xCF: {
                    // Logo transmission
                    tsDescriptor = new tsDescriptorList.TsDescriptorLogoTransmission(buffer);

                    break;
                }

                case 0xD0: {
                    // Basic local_event
                    tsDescriptor = new tsDescriptorList.TsDescriptorBasicLocalEvent(buffer);

                    break;
                }

                case 0xD1: {
                    // Reference
                    tsDescriptor = new tsDescriptorList.TsDescriptorReference(buffer);

                    break;
                }

                case 0xD2: {
                    // Node relation
                    tsDescriptor = new tsDescriptorList.TsDescriptorNodeRelation(buffer);

                    break;
                }

                case 0xD3: {
                    // Short node information
                    tsDescriptor = new tsDescriptorList.TsDescriptorShortNodeInformation(buffer);

                    break;
                }

                case 0xD4: {
                    // STC reference
                    tsDescriptor = new tsDescriptorList.TsDescriptorStcReference(buffer);

                    break;
                }

                case 0xD5: {
                    // Series
                    tsDescriptor = new tsDescriptorList.TsDescriptorSeries(buffer);

                    break;
                }

                case 0xD6: {
                    // Event group
                    tsDescriptor = new tsDescriptorList.TsDescriptorEventGroup(buffer);

                    break;
                }

                case 0xD7: {
                    // SI parameter
                    tsDescriptor = new tsDescriptorList.TsDescriptorSiParameter(buffer);

                    break;
                }

                case 0xD8: {
                    // Broadcaster name
                    tsDescriptor = new tsDescriptorList.TsDescriptorBroadcasterName(buffer);

                    break;
                }

                case 0xD9: {
                    // Component group
                    tsDescriptor = new tsDescriptorList.TsDescriptorComponentGroup(buffer);

                    break;
                }

                case 0xDA: {
                    // SI prime_ts
                    tsDescriptor = new tsDescriptorList.TsDescriptorSiPrimeTs(buffer);

                    break;
                }

                case 0xDB: {
                    // Board information
                    tsDescriptor = new tsDescriptorList.TsDescriptorBoardInformation(buffer);

                    break;
                }

                case 0xDC: {
                    // LDT linkage
                    tsDescriptor = new tsDescriptorList.TsDescriptorLdtLinkage(buffer);

                    break;
                }

                case 0xDD: {
                    // Connected transmission
                    tsDescriptor = new tsDescriptorList.TsDescriptorConnectedTransmission(buffer);

                    break;
                }

                case 0xDE: {
                    // Content availability
                    tsDescriptor = new tsDescriptorList.TsDescriptorContentAvailability(buffer);

                    break;
                }

                case 0xDF: {
                    // Reserved

                    break;
                }

                case 0xE0: {
                    // Service group
                    tsDescriptor = new tsDescriptorList.TsDescriptorServiceGroup(buffer);

                    break;
                }

                case 0xE1: {
                    // Area broadcasting information
                    tsDescriptor = new tsDescriptorList.TsDescriptorAreaBroadcastingInformation(buffer);

                    break;
                }

                case 0xE2: {
                    // Network download content
                    tsDescriptor = new tsDescriptorList.TsDescriptorNetworkDownloadContent(buffer);

                    break;
                }

                case 0xE3: {
                    // DL protection
                    tsDescriptor = new tsDescriptorList.TsDescriptorDlProtection(buffer);

                    break;
                }

                case 0xE4: {
                    // CA startup
                    tsDescriptor = new tsDescriptorList.TsDescriptorCaStartup(buffer);

                    break;
                }

                case 0xF3: {
                    // Cable multi-carrier transmission delivery system
                    tsDescriptor = new tsDescriptorList.TsDescriptorCableMulticarrierTransmissionDeliverySystem(buffer);

                    break;
                }

                case 0xF4: {
                    // Advanced cable delivery system
                    tsDescriptor = new tsDescriptorList.TsDescriptorAdvancedCableDeliverySystem(buffer);

                    break;
                }

                case 0xF5: {
                    // Scramble system
                    tsDescriptor = new tsDescriptorList.TsDescriptorScrambleSystem(buffer);

                    break;
                }

                case 0xF6: {
                    // Access control
                    tsDescriptor = new tsDescriptorList.TsDescriptorAccessControl(buffer);

                    break;
                }

                case 0xF7: {
                    // Carousel compatible composite
                    tsDescriptor = new tsDescriptorList.TsDescriptorCarouselCompatibleComposite(buffer);

                    break;
                }

                case 0xF8: {
                    // Conditional playback
                    tsDescriptor = new tsDescriptorList.TsDescriptorConditionalPlayback(buffer);

                    break;
                }

                case 0xF9: {
                    // Cable TS division system
                    tsDescriptor = new tsDescriptorList.TsDescriptorCableTsDivisionSystem(buffer);

                    break;
                }

                case 0xFA: {
                    // Terrestrial delivery system
                    tsDescriptor = new tsDescriptorList.TsDescriptorTerrestrialDeliverySystem(buffer);

                    break;
                }

                case 0xFB: {
                    // Partial reception
                    tsDescriptor = new tsDescriptorList.TsDescriptorPartialReception(buffer);

                    break;
                }

                case 0xFC: {
                    // Emergency information
                    tsDescriptor = new tsDescriptorList.TsDescriptorEmergencyInformation(buffer);

                    break;
                }

                case 0xFD: {
                    // Data component
                    tsDescriptor = new tsDescriptorList.TsDescriptorDataComponent(buffer);

                    break;
                }

                case 0xFE: {
                    // System management
                    tsDescriptor = new tsDescriptorList.TsDescriptorSystemManagement(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsDescriptor = new tsDescriptorList.TsDescriptorBase(buffer);
                }
            }

            tsDescriptors.push(tsDescriptor);
        }

        return tsDescriptors;
    }
}

module.exports = TsDescriptors;
