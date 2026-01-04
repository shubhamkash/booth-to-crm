const axios = require('axios');

class EnrichmentService {
  static async enrichLead(email, company) {
    try {
      console.log('=== Lead Enrichment ===');
      console.log('Email:', email, 'Company:', company);
      
      if (!process.env.APOLLO_API_KEY) {
        console.warn('No Apollo API key, using intelligent mock');
        return this.intelligentEnrichment(email, company);
      }

      // Use Apollo API for enrichment
      const domain = email ? email.split('@')[1] : null;
      
      if (domain) {
        return await this.enrichByDomain(domain);
      } else if (company) {
        return await this.enrichByCompany(company);
      }
      
      return { success: false, error: 'No domain or company provided' };
    } catch (error) {
      console.error('Enrichment failed:', error.message);
      return this.intelligentEnrichment(email, company);
    }
  }

  static async enrichByDomain(domain) {
    try {
      const response = await axios.post('https://api.apollo.io/v1/organizations/enrich', {
        domain: domain
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': process.env.APOLLO_API_KEY
        }
      });

      const org = response.data.organization;
      if (org) {
        return {
          success: true,
          data: {
            name: org.name,
            company: org.name,
            industry: org.industry,
            company_size: this.categorizeSize(org.estimated_num_employees),
            linkedin_url: org.linkedin_url,
            website: org.website_url,
            description: org.short_description
          }
        };
      }
      
      return this.intelligentEnrichment(null, domain);
    } catch (error) {
      console.error('Apollo domain enrichment failed:', error.message);
      return this.intelligentEnrichment(null, domain);
    }
  }

  static async enrichByCompany(company) {
    try {
      const response = await axios.post('https://api.apollo.io/v1/organizations/search', {
        q_organization_name: company,
        page: 1,
        per_page: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': process.env.APOLLO_API_KEY
        }
      });

      const orgs = response.data.organizations;
      if (orgs && orgs.length > 0) {
        const org = orgs[0];
        return {
          success: true,
          data: {
            industry: org.industry,
            company_size: this.categorizeSize(org.estimated_num_employees),
            linkedin_url: org.linkedin_url,
            website: org.website_url,
            description: org.short_description
          }
        };
      }
      
      return this.intelligentEnrichment(null, company);
    } catch (error) {
      console.error('Apollo company search failed:', error.message);
      return this.intelligentEnrichment(null, company);
    }
  }

  static categorizeSize(employees) {
    if (!employees) return null;
    if (employees < 10) return '1-10';
    if (employees < 50) return '11-50';
    if (employees < 200) return '51-200';
    if (employees < 1000) return '201-1000';
    return '1000+';
  }

  static intelligentEnrichment(email, company) {
    const domain = email ? email.split('@')[1] : null;
    const companyName = company || domain?.replace('.com', '').replace('.', ' ');
    
    let industry = 'Technology';
    let size = '51-200';
    
    if (domain) {
      if (domain.includes('bank') || domain.includes('finance')) {
        industry = 'Financial Services';
        size = '1000+';
      } else if (domain.includes('health') || domain.includes('medical')) {
        industry = 'Healthcare';
        size = '201-1000';
      } else if (domain.includes('edu')) {
        industry = 'Education';
        size = '1000+';
      }
    }
    
    return {
      success: true,
      data: {
        industry,
        company_size: size,
        linkedin_url: `https://linkedin.com/company/${companyName?.toLowerCase().replace(/\s+/g, '-')}`,
        website: domain ? `https://${domain}` : null,
        description: `${companyName} - ${industry} company`
      }
    };
  }

  static mockEnrichment(email, company) {
    return this.intelligentEnrichment(email, company);
  }
}

module.exports = EnrichmentService;