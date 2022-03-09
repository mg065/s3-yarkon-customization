def yarkon_custom_download():
    try:
        params = request.vars
        current_time = datetime.utcnow()
        expiration_time_in_string = json.loads(params.expiration_time)
        expiration_time = datetime.strptime(expiration_time_in_string, '%Y-%m-%d %H:%M:%S.%f')  # add %z for time zone
        # print "expiration_time_is: ", expiration_time

        if expiration_time > current_time:
            expired = False
        else:
            expired = True

        if expired:
            return dict(expired=True)

        else:
            user_company = json.loads(params.user_company)
            company_filter = (db.company.id == user_company)
            user_company_details = Companies().get_company_by_filter(company_filter, db)

            files_details_list = []
            unique_key = str(json.loads(request.vars.unique_key))
            files_url_filter = db.yarkon_files_share.unique_key == unique_key
            files_shared_record = db(files_url_filter).select(db.yarkon_files_share.ALL).first()
            file_presigned_urls = json.loads(files_shared_record.files_url)

            total_file_size_in_bytes = 0
            for file_details in file_presigned_urls:
                file_name = file_details.get('file_name')
                file_size_in_string = str(file_details.get('file_size'))
                file_size_in_bytes = file_details.get('file_size')
                convert_file_size = convert_size(file_size_in_string)
                total_file_size_in_bytes += file_details.get('file_size')
                # print file_name, convert_file_size

                guest_file_link_url = (file_details.get('guest_file_link_url')).replace('^', '&')
                # print guest_file_link_url

                file_details_dict = {"file_name": file_name,
                                     "guest_file_link_url": guest_file_link_url,
                                     "file_size": convert_file_size,
                                     "file_size_in_bytes":file_size_in_bytes,
                                     }

                files_details_list.append(file_details_dict)

            return dict(expired=False, file_details_list=files_details_list, user_company_details=user_company_details,total_file_size_in_bytes=total_file_size_in_bytes)

    except Exception as e:
        print e
        return {'status': e.message}

