import Base from "./descriptor/base";
import VideoStream from "./descriptor/video_stream";
import AudioStream from "./descriptor/audio_stream";
import Hierarchy from "./descriptor/hierarchy";
import Registration from "./descriptor/registration";
import DataStreamAlignment from "./descriptor/data_stream_alignment";
import TargetBackgroundGrid from "./descriptor/target_background_grid";
import VideoWindow from "./descriptor/video_window";
import ConditionalAccess from "./descriptor/conditional_access";
import Iso639Language from "./descriptor/iso_639_language";
import SystemClock from "./descriptor/system_clock";
import MultiplexBufferUtilization from "./descriptor/multiplex_buffer_utilization";
import Copyright from "./descriptor/copyright";
import PrivateDataIndicator from "./descriptor/private_data_indicator";
import SmoothingBuffer from "./descriptor/smoothing_buffer";
import Std from "./descriptor/std";
import Ibp from "./descriptor/ibp";
import NetworkName from "./descriptor/network_name";
import ServiceList from "./descriptor/service_list";
import Stuffing from "./descriptor/stuffing";
import SatelliteDeliverySystem from "./descriptor/satellite_delivery_system";
import CableDeliverySystem from "./descriptor/cable_delivery_system";
import BouquetName from "./descriptor/bouquet_name";
import Service from "./descriptor/service";
import CountryAvailability from "./descriptor/country_availability";
import Linkage from "./descriptor/linkage";
import NearVideoOnDemandReference from "./descriptor/near_video_on_demand_reference";
import TimeShiftedService from "./descriptor/time_shifted_service";
import ShortEvent from "./descriptor/short_event";
import ExtendedEvent from "./descriptor/extended_event";
import TimeShiftedEvent from "./descriptor/time_shifted_event";
import Component from "./descriptor/component";
import Mosaic from "./descriptor/mosaic";
import StreamIdentifier from "./descriptor/stream_identifier";
import CaIdentifier from "./descriptor/ca_identifier";
import Content from "./descriptor/content";
import ParentalRating from "./descriptor/parental_rating";
import LocalTimeOffset from "./descriptor/local_time_offset";
import PartialTransportStream from "./descriptor/partial_transport_stream";
import DataBroadcastId from "./descriptor/data_broadcast_id";
import MaterialInformation from "./descriptor/material_information";
import HybridInformation from "./descriptor/hybrid_information";
import HierarchicalTransmission from "./descriptor/hierarchical_transmission";
import DigitalCopyControl from "./descriptor/digital_copy_control";
import NetworkIdentification from "./descriptor/network_identification";
import PartialTransportStreamTime from "./descriptor/partial_transport_stream_time";
import AudioComponent from "./descriptor/audio_component";
import Hyperlink from "./descriptor/hyperlink";
import TargetRegion from "./descriptor/target_region";
import DataContent from "./descriptor/data_content";
import VideoDecodeControl from "./descriptor/video_decode_control";
import DownloadContent from "./descriptor/download_content";
import CaEmmTs from "./descriptor/ca_emm_ts";
import CaContractInfo from "./descriptor/ca_contract_info";
import CaService from "./descriptor/ca_service";
import TsInformation from "./descriptor/ts_information";
import ExtendedBroadcaster from "./descriptor/extended_broadcaster";
import LogoTransmission from "./descriptor/logo_transmission";
import BasicLocalEvent from "./descriptor/basic_local_event";
import Reference from "./descriptor/reference";
import NodeRelation from "./descriptor/node_relation";
import ShortNodeInformation from "./descriptor/short_node_information";
import StcReference from "./descriptor/stc_reference";
import Series from "./descriptor/series";
import EventGroup from "./descriptor/event_group";
import SiParameter from "./descriptor/si_parameter";
import BroadcasterName from "./descriptor/broadcaster_name";
import ComponentGroup from "./descriptor/component_group";
import SiPrimeTs from "./descriptor/si_prime_ts";
import BoardInformation from "./descriptor/board_information";
import LdtLinkage from "./descriptor/ldt_linkage";
import ConnectedTransmission from "./descriptor/connected_transmission";
import ContentAvailability from "./descriptor/content_availability";
import ServiceGroup from "./descriptor/service_group";
import AreaBroadcastingInformation from "./descriptor/area_broadcasting_information";
import NetworkDownloadContent from "./descriptor/network_download_content";
import DlProtection from "./descriptor/dl_protection";
import CaStartup from "./descriptor/ca_startup";
import CableMulticarrierTransmissionDeliverySystem from "./descriptor/cable_multicarrier_transmission_delivery_system";
import AdvancedCableDeliverySystem from "./descriptor/advanced_cable_delivery_system";
import ScrambleSystem from "./descriptor/scramble_system";
import AccessControl from "./descriptor/access_control";
import CarouselCompatibleComposite from "./descriptor/carousel_compatible_composite";
import ConditionalPlayback from "./descriptor/conditional_playback";
import CableTsDivisionSystem from "./descriptor/cable_ts_division_system";
import TerrestrialDeliverySystem from "./descriptor/terrestrial_delivery_system";
import PartialReception from "./descriptor/partial_reception";
import EmergencyInformation from "./descriptor/emergency_information";
import DataComponent from "./descriptor/data_component";
import SystemManagement from "./descriptor/system_management";

export type TsDescriptor = (
    Base |
    VideoStream |
    AudioStream |
    Hierarchy |
    Registration |
    DataStreamAlignment |
    TargetBackgroundGrid |
    VideoWindow |
    ConditionalAccess |
    Iso639Language |
    SystemClock |
    MultiplexBufferUtilization |
    Copyright |
    PrivateDataIndicator |
    SmoothingBuffer |
    Std |
    Ibp |
    NetworkName |
    ServiceList |
    Stuffing |
    SatelliteDeliverySystem |
    CableDeliverySystem |
    BouquetName |
    Service |
    CountryAvailability |
    Linkage |
    NearVideoOnDemandReference |
    TimeShiftedService |
    ShortEvent |
    ExtendedEvent |
    TimeShiftedEvent |
    Component |
    Mosaic |
    StreamIdentifier |
    CaIdentifier |
    Content |
    ParentalRating |
    LocalTimeOffset |
    PartialTransportStream |
    DataBroadcastId |
    MaterialInformation |
    HybridInformation |
    HierarchicalTransmission |
    DigitalCopyControl |
    NetworkIdentification |
    PartialTransportStreamTime |
    AudioComponent |
    Hyperlink |
    TargetRegion |
    DataContent |
    VideoDecodeControl |
    DownloadContent |
    CaEmmTs |
    CaContractInfo |
    CaService |
    TsInformation |
    ExtendedBroadcaster |
    LogoTransmission |
    BasicLocalEvent |
    Reference |
    NodeRelation |
    ShortNodeInformation |
    StcReference |
    Series |
    EventGroup |
    SiParameter |
    BroadcasterName |
    ComponentGroup |
    SiPrimeTs |
    BoardInformation |
    LdtLinkage |
    ConnectedTransmission |
    ContentAvailability |
    ServiceGroup |
    AreaBroadcastingInformation |
    NetworkDownloadContent |
    DlProtection |
    CaStartup |
    CableMulticarrierTransmissionDeliverySystem |
    AdvancedCableDeliverySystem |
    ScrambleSystem |
    AccessControl |
    CarouselCompatibleComposite |
    ConditionalPlayback |
    CableTsDivisionSystem |
    TerrestrialDeliverySystem |
    PartialReception |
    EmergencyInformation |
    DataComponent |
    SystemManagement
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
                    tsDescriptor = new VideoStream(buffer);
                    break;
                }

                case 0x03: {
                    // Audio stream
                    tsDescriptor = new AudioStream(buffer);

                    break;
                }

                case 0x04: {
                    // Hierarchy
                    tsDescriptor = new Hierarchy(buffer);

                    break;
                }

                case 0x05: {
                    // Registration
                    tsDescriptor = new Registration(buffer);

                    break;
                }

                case 0x06: {
                    // Data stream alignment
                    tsDescriptor = new DataStreamAlignment(buffer);

                    break;
                }

                case 0x07: {
                    // Target background grid
                    tsDescriptor = new TargetBackgroundGrid(buffer);

                    break;
                }

                case 0x08: {
                    // Video window
                    tsDescriptor = new VideoWindow(buffer);

                    break;
                }

                case 0x09: {
                    // Conditional access
                    tsDescriptor = new ConditionalAccess(buffer);

                    break;
                }

                case 0x0A: {
                    // ISO 639 language
                    tsDescriptor = new Iso639Language(buffer);

                    break;
                }

                case 0x0B: {
                    // System clock
                    tsDescriptor = new SystemClock(buffer);

                    break;
                }

                case 0x0C: {
                    // Multiplex buffer utilization
                    tsDescriptor = new MultiplexBufferUtilization(buffer);

                    break;
                }

                case 0x0D: {
                    // Copyright
                    tsDescriptor = new Copyright(buffer);

                    break;
                }

                case 0x0F: {
                    // Private data indicator
                    tsDescriptor = new PrivateDataIndicator(buffer);

                    break;
                }

                case 0x10: {
                    // Smoothing buffer
                    tsDescriptor = new SmoothingBuffer(buffer);

                    break;
                }

                case 0x11: {
                    // STD
                    tsDescriptor = new Std(buffer);

                    break;
                }

                case 0x12: {
                    // IBP
                    tsDescriptor = new Ibp(buffer);

                    break;
                }

                case 0x40: {
                    // Network name
                    tsDescriptor = new NetworkName(buffer);

                    break;
                }

                case 0x41: {
                    // Service list
                    tsDescriptor = new ServiceList(buffer);

                    break;
                }

                case 0x42: {
                    // Stuffing
                    tsDescriptor = new Stuffing(buffer);

                    break;
                }

                case 0x43: {
                    //Satellite delivery system
                    tsDescriptor = new SatelliteDeliverySystem(buffer);

                    break;
                }

                case 0x44: {
                    //Cable delivery system
                    tsDescriptor = new CableDeliverySystem(buffer);

                    break;
                }

                case 0x47: {
                    // Bouquet name
                    tsDescriptor = new BouquetName(buffer);

                    break;
                }

                case 0x48: {
                    // Service
                    tsDescriptor = new Service(buffer);

                    break;
                }

                case 0x49: {
                    // Country availability
                    tsDescriptor = new CountryAvailability(buffer);

                    break;
                }

                case 0x4A: {
                    // Linkage
                    tsDescriptor = new Linkage(buffer);

                    break;
                }

                case 0x4B: {
                    //  Near Video On Demand reference
                    tsDescriptor = new NearVideoOnDemandReference(buffer);

                    break;
                }

                case 0x4C: {
                    // Time shifted service
                    tsDescriptor = new TimeShiftedService(buffer);

                    break;
                }

                case 0x4D: {
                    // Short event
                    tsDescriptor = new ShortEvent(buffer);

                    break;
                }

                case 0x4E: {
                    // Extended event
                    tsDescriptor = new ExtendedEvent(buffer);

                    break;
                }

                case 0x4F: {
                    // Time shifted event
                    tsDescriptor = new TimeShiftedEvent(buffer);

                    break;
                }

                case 0x50: {
                    // Component
                    tsDescriptor = new Component(buffer);

                    break;
                }

                case 0x51: {
                    // Mosaic
                    tsDescriptor = new Mosaic(buffer);

                    break;
                }

                case 0x52: {
                    // Stream identifier
                    tsDescriptor = new StreamIdentifier(buffer);

                    break;
                }

                case 0x53: {
                    // CA identifier
                    tsDescriptor = new CaIdentifier(buffer);

                    break;
                }

                case 0x54: {
                    // Content
                    tsDescriptor = new Content(buffer);

                    break;
                }

                case 0x55: {
                    // Parental rating
                    tsDescriptor = new ParentalRating(buffer);

                    break;
                }

                case 0x58: {
                    // Local time offset
                    tsDescriptor = new LocalTimeOffset(buffer);

                    break;
                }

                case 0x63: {
                    // Partial transport stream
                    tsDescriptor = new PartialTransportStream(buffer);

                    break;
                }

                case 0x66: {
                    // Data broadcast id
                    tsDescriptor = new DataBroadcastId(buffer);

                    break;
                }

                case 0x67: {
                    // Material information
                    tsDescriptor = new MaterialInformation(buffer);

                    break;
                }

                case 0x68: {
                    // Hybrid information
                    tsDescriptor = new HybridInformation(buffer);

                    break;
                }

                case 0xC0: {
                    // Hierarchical transmission
                    tsDescriptor = new HierarchicalTransmission(buffer);

                    break;
                }

                case 0xC1: {
                    // Digital copy control
                    tsDescriptor = new DigitalCopyControl(buffer);

                    break;
                }

                case 0xC2: {
                    // Network identification
                    tsDescriptor = new NetworkIdentification(buffer);

                    break;
                }

                case 0xC3: {
                    // Partial transport stream time
                    tsDescriptor = new PartialTransportStreamTime(buffer);

                    break;
                }

                case 0xC4: {
                    // Audio component
                    tsDescriptor = new AudioComponent(buffer);

                    break;
                }

                case 0xC5: {
                    // Hyperlink
                    tsDescriptor = new Hyperlink(buffer);

                    break;
                }

                case 0xC6: {
                    // Target region
                    tsDescriptor = new TargetRegion(buffer);

                    break;
                }

                case 0xC7: {
                    // Data content
                    tsDescriptor = new DataContent(buffer);

                    break;
                }

                case 0xC8: {
                    // Video decode control
                    tsDescriptor = new VideoDecodeControl(buffer);

                    break;
                }

                case 0xC9: {
                    // Download content
                    tsDescriptor = new DownloadContent(buffer);

                    break;
                }

                case 0xCA: {
                    // CA emm ts
                    tsDescriptor = new CaEmmTs(buffer);

                    break;
                }

                case 0xCB: {
                    // CA contract info
                    tsDescriptor = new CaContractInfo(buffer);

                    break;
                }

                case 0xCC: {
                    // CA service
                    tsDescriptor = new CaService(buffer);

                    break;
                }

                case 0xCD: {
                    // TS information
                    tsDescriptor = new TsInformation(buffer);

                    break;
                }

                case 0xCE: {
                    // Extended broadcaster
                    tsDescriptor = new ExtendedBroadcaster(buffer);

                    break;
                }

                case 0xCF: {
                    // Logo transmission
                    tsDescriptor = new LogoTransmission(buffer);

                    break;
                }

                case 0xD0: {
                    // Basic local_event
                    tsDescriptor = new BasicLocalEvent(buffer);

                    break;
                }

                case 0xD1: {
                    // Reference
                    tsDescriptor = new Reference(buffer);

                    break;
                }

                case 0xD2: {
                    // Node relation
                    tsDescriptor = new NodeRelation(buffer);

                    break;
                }

                case 0xD3: {
                    // Short node information
                    tsDescriptor = new ShortNodeInformation(buffer);

                    break;
                }

                case 0xD4: {
                    // STC reference
                    tsDescriptor = new StcReference(buffer);

                    break;
                }

                case 0xD5: {
                    // Series
                    tsDescriptor = new Series(buffer);

                    break;
                }

                case 0xD6: {
                    // Event group
                    tsDescriptor = new EventGroup(buffer);

                    break;
                }

                case 0xD7: {
                    // SI parameter
                    tsDescriptor = new SiParameter(buffer);

                    break;
                }

                case 0xD8: {
                    // Broadcaster name
                    tsDescriptor = new BroadcasterName(buffer);

                    break;
                }

                case 0xD9: {
                    // Component group
                    tsDescriptor = new ComponentGroup(buffer);

                    break;
                }

                case 0xDA: {
                    // SI prime_ts
                    tsDescriptor = new SiPrimeTs(buffer);

                    break;
                }

                case 0xDB: {
                    // Board information
                    tsDescriptor = new BoardInformation(buffer);

                    break;
                }

                case 0xDC: {
                    // LDT linkage
                    tsDescriptor = new LdtLinkage(buffer);

                    break;
                }

                case 0xDD: {
                    // Connected transmission
                    tsDescriptor = new ConnectedTransmission(buffer);

                    break;
                }

                case 0xDE: {
                    // Content availability
                    tsDescriptor = new ContentAvailability(buffer);

                    break;
                }

                case 0xDF: {
                    // Reserved

                    break;
                }

                case 0xE0: {
                    // Service group
                    tsDescriptor = new ServiceGroup(buffer);

                    break;
                }

                case 0xE1: {
                    // Area broadcasting information
                    tsDescriptor = new AreaBroadcastingInformation(buffer);

                    break;
                }

                case 0xE2: {
                    // Network download content
                    tsDescriptor = new NetworkDownloadContent(buffer);

                    break;
                }

                case 0xE3: {
                    // DL protection
                    tsDescriptor = new DlProtection(buffer);

                    break;
                }

                case 0xE4: {
                    // CA startup
                    tsDescriptor = new CaStartup(buffer);

                    break;
                }

                case 0xF3: {
                    // Cable multi-carrier transmission delivery system
                    tsDescriptor = new CableMulticarrierTransmissionDeliverySystem(buffer);

                    break;
                }

                case 0xF4: {
                    // Advanced cable delivery system
                    tsDescriptor = new AdvancedCableDeliverySystem(buffer);

                    break;
                }

                case 0xF5: {
                    // Scramble system
                    tsDescriptor = new ScrambleSystem(buffer);

                    break;
                }

                case 0xF6: {
                    // Access control
                    tsDescriptor = new AccessControl(buffer);

                    break;
                }

                case 0xF7: {
                    // Carousel compatible composite
                    tsDescriptor = new CarouselCompatibleComposite(buffer);

                    break;
                }

                case 0xF8: {
                    // Conditional playback
                    tsDescriptor = new ConditionalPlayback(buffer);

                    break;
                }

                case 0xF9: {
                    // Cable TS division system
                    tsDescriptor = new CableTsDivisionSystem(buffer);

                    break;
                }

                case 0xFA: {
                    // Terrestrial delivery system
                    tsDescriptor = new TerrestrialDeliverySystem(buffer);

                    break;
                }

                case 0xFB: {
                    // Partial reception
                    tsDescriptor = new PartialReception(buffer);

                    break;
                }

                case 0xFC: {
                    // Emergency information
                    tsDescriptor = new EmergencyInformation(buffer);

                    break;
                }

                case 0xFD: {
                    // Data component
                    tsDescriptor = new DataComponent(buffer);

                    break;
                }

                case 0xFE: {
                    // System management
                    tsDescriptor = new SystemManagement(buffer);

                    break;
                }

                default: {
                    // Unknown
                    tsDescriptor = new Base(buffer);
                }
            }

            tsDescriptors.push(tsDescriptor);
        }

        return tsDescriptors;
    }
}
