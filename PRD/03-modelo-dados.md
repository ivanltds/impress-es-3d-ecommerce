# Modelo de Dados Inicial

> **Domínios:** Identity, Catalog, Customization, Cart, Orders, Payments, Customer, Experience, Operations, Marketing

---

## Entidades Principais

### User
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| name | string | Nome completo |
| email | string | Único |
| password_hash | string | Hash da senha |
| phone | string? | Telefone |
| role | enum | admin, operator, partner, customer |
| marketing_consent | boolean | Consentimento marketing |
| preferred_theme | string? | Tema escolhido |
| preferred_collection | string? | Coleção preferida |
| status | enum | active, inactive, banned |
| created_at | datetime | |
| updated_at | datetime | |

### CustomerProfile
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → User |
| display_name | string? | Nome de exibição |
| style_preference | string? | Estilo preferido |
| favorite_collections | string[]? | Coleções favoritas |
| notes | text? | Observações internas |
| last_seen_collection | string? | Última coleção visitada |

### Address
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → User |
| label | string | Casa, Trabalho, etc. |
| recipient_name | string | Nome do destinatário |
| cep | string | CEP |
| street | string | Logradouro |
| number | string | Número |
| complement | string? | Complemento |
| district | string | Bairro |
| city | string | Cidade |
| state | string | UF |
| country | string | Default: Brasil |
| is_default | boolean | Endereço padrão |

### Collection
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| slug | string | Único |
| name | string | Nome da coleção |
| description | text | Descrição |
| theme_key | string | Chave do tema visual |
| hero_content | json? | Config do hero |
| status | enum | draft, published, archived |
| seo_title | string? | |
| seo_description | string? | |

### Category
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| collection_id | uuid? | FK → Collection |
| name | string | |
| slug | string | Único |
| description | text? | |

### Product
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| slug | string | Único, URL amigável |
| name | string | Nome comercial |
| internal_name | string? | Nome interno |
| short_description | text | Descrição curta |
| long_description | text? | Descrição longa |
| category_id | uuid? | FK → Category |
| collection_id | uuid? | FK → Collection |
| product_type | enum | simple, configurable, custom |
| status | enum | draft, published, archived |
| base_price | decimal | Preço base |
| compare_price | decimal? | Preço "de" para comparação |
| estimated_production_time | int? | Horas estimadas |
| cost_estimate | decimal? | Custo estimado de produção |
| is_featured | boolean | Destaque |
| is_customizable | boolean | Aceita personalização |
| customization_level | enum | none, simple, moderate, on_request |
| inventory_mode | enum | on_demand, pre_made |
| material | string? | Material principal |
| seo_title | string? | |
| seo_description | string? | |
| legal_notes | text? | Observações legais |
| created_at | datetime | |
| updated_at | datetime | |

### ProductVariant
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| product_id | uuid | FK → Product |
| sku | string | Único |
| color | string? | Cor |
| size | string? | Tamanho |
| material | string? | Material |
| finish | string? | Acabamento |
| price_delta | decimal | Ajuste no preço (0 = preço base) |
| production_time_delta | int? | Ajuste no tempo |
| active | boolean | |

### ProductCustomizationRule
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| product_id | uuid | FK → Product |
| field_type | enum | color, size, text, select, boolean |
| label | string | Nome exibido |
| key | string | Identificador |
| required | boolean | Obrigatório |
| min | int? | Mínimo (texto: caracteres) |
| max | int? | Máximo |
| options_json | json? | Opções (select) |
| pricing_rule | json? | Regra de preço adicional |
| validation_rule | string? | Regex ou regra |

### ProductMedia
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| product_id | uuid | FK → Product |
| url | string | URL (Vercel Blob) |
| type | enum | image, video, mockup |
| alt | string? | Texto alternativo |
| sort_order | int | Ordem |

### Cart
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid? | FK → User (nullable para guest) |
| session_id | string | ID da sessão |
| status | enum | active, converted, abandoned |

### CartItem
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| cart_id | uuid | FK → Cart |
| product_id | uuid | FK → Product |
| variant_id | uuid? | FK → ProductVariant |
| qty | int | Quantidade |
| unit_price | decimal | Preço unitário no momento |
| customization_payload | json? | Personalização aplicada |
| line_total | decimal | Subtotal da linha |

### Order
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid? | FK → User |
| order_number | string | Único, legível (ex: 3DP-00042) |
| status | enum | Ver fluxo de produção |
| payment_status | enum | pending, paid, refunded, failed |
| fulfillment_status | enum | unfulfilled, in_progress, fulfilled |
| subtotal | decimal | |
| shipping_cost | decimal | |
| discount | decimal | |
| total | decimal | |
| currency | string | Default: BRL |
| source_channel | string | instagram, direct, whatsapp, other |
| notes | text? | Observações do cliente |
| theme_snapshot | string? | Tema no momento da compra |
| created_at | datetime | |

### OrderItem
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| order_id | uuid | FK → Order |
| product_id | uuid | FK → Product |
| product_name_snapshot | string | Nome no momento |
| sku_snapshot | string | SKU no momento |
| qty | int | |
| unit_price | decimal | |
| customization_snapshot | json? | |
| production_status | enum | |
| production_notes | text? | |

### Payment
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| order_id | uuid | FK → Order |
| provider | string | stripe, mercadopago |
| provider_ref | string | ID externo |
| amount | decimal | |
| status | enum | pending, completed, failed, refunded |
| paid_at | datetime? | |
| raw_payload | json? | |

### Shipment
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| order_id | uuid | FK → Order |
| carrier | string? | Transportadora |
| tracking_code | string? | Código de rastreio |
| shipping_status | enum | pending, shipped, in_transit, delivered |
| shipped_at | datetime? | |
| delivered_at | datetime? | |

### Lead
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| name | string | |
| email | string? | |
| phone | string? | |
| source | string | instagram, direct, referral |
| interest_collection | string? | Coleção de interesse |
| message | text | |
| created_at | datetime | |

### ThemePreference
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| user_id | uuid? | FK → User |
| session_id | string? | Para guest |
| theme_key | string | Tema ativo |
| source | enum | manual, suggested, default |
| last_updated | datetime | |

### ProductionJob
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| order_item_id | uuid | FK → OrderItem |
| assigned_partner | string? | Parceiro responsável |
| machine_id | string? | Máquina (futuro) |
| print_estimate_hours | decimal? | Horas estimadas |
| material_cost_estimate | decimal? | Custo de material |
| started_at | datetime? | |
| finished_at | datetime? | |
| qc_status | enum | pending, passed, failed |
| failure_reason | text? | |

---

## Domínios da Arquitetura

| Domínio | Responsabilidade |
|---------|-----------------|
| **Identity/Auth** | User, autenticação, roles |
| **Catalog** | Product, Variant, Category, Collection, Media |
| **Product Customization** | CustomizationRule, payload |
| **Cart/Checkout** | Cart, CartItem, transição para Order |
| **Orders** | Order, OrderItem |
| **Payments** | Payment, integração gateway |
| **Customer Profile & Preferences** | CustomerProfile, Address, ThemePreference |
| **Experience/Theming Engine** | Collection, ThemePreference, tokens |
| **Admin CMS** | CRUD products, collections, content |
| **Operations/Production Queue** | ProductionJob, status flow |
| **Marketing/Analytics** | Lead, eventos, UTM, Pixel |
| **Notifications** | E-mail transacional, status updates |
